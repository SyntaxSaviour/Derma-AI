import base64
import io
import os
import time
from dataclasses import dataclass
from typing import Literal, Tuple

import numpy as np
import onnxruntime as ort
from fastapi import UploadFile
from PIL import Image

from inference.recommendation import generate_recommendation
from utils.errors import InferenceError
from utils.image import (
    decode_and_validate_image,
    normalize_imagenet,
    resize_image,
)
Label = Literal["benign", "malignant"]


@dataclass
class InferenceConfig:
    segmentation_model_path: str = os.getenv(
        "SEGMENTATION_MODEL_PATH", "artefacts/models/segmentation.onnx"
    )
    classification_model_path: str = os.getenv(
        "CLASSIFICATION_MODEL_PATH", "artefacts/models/classification.onnx"
    )
    device: str = "cpu"


class InferenceService:
    """
    Orchestrates the full image → mask → ROI → classification pipeline.
    """

    def __init__(self, config: InferenceConfig | None = None) -> None:
        self._config = config or InferenceConfig()
        self._seg_session: ort.InferenceSession | None = None
        self._clf_session: ort.InferenceSession | None = None
        self._load_sessions()

    @property
    def models_loaded(self) -> bool:
        return self._seg_session is not None and self._clf_session is not None

    def _load_sessions(self) -> None:
        """
        Load ONNX models into memory.

        If models are missing, the service will remain in a non-ready state
        but the process will still start, allowing /health checks.
        """
        sess_options = ort.SessionOptions()
        sess_options.inter_op_num_threads = 4
        sess_options.intra_op_num_threads = 4

        try:
            if os.path.exists(self._config.segmentation_model_path):
                self._seg_session = ort.InferenceSession(
                    self._config.segmentation_model_path,
                    sess_options,
                    providers=["CPUExecutionProvider"],
                )
            if os.path.exists(self._config.classification_model_path):
                self._clf_session = ort.InferenceSession(
                    self._config.classification_model_path,
                    sess_options,
                    providers=["CPUExecutionProvider"],
                )
        except Exception as exc:  # pragma: no cover - startup failure
            # Leave sessions as None; health endpoint will reflect this.
            self._seg_session = None
            self._clf_session = None
            raise InferenceError(f"Failed to load ONNX models: {exc}") from exc

    async def run_inference(self, file: UploadFile) -> dict:
        """
        Full inference pipeline for a single uploaded image.
        """
        if not self.models_loaded:
            raise InferenceError("Models are not loaded; service is not ready.")

        start_time = time.perf_counter()

        # 1. validate image & decode
        image = await decode_and_validate_image(file)

        # 2. resize 256x256
        resized = resize_image(image, size=(256, 256))

        # 3. normalize with ImageNet stats
        input_tensor = normalize_imagenet(resized)  # shape (1, 3, 256, 256)

        # 4. run segmentation ONNX model
        mask = self._run_segmentation(input_tensor)  # (256, 256) boolean

        # 5. crop ROI
        roi_image = self._crop_roi(image, mask)

        # 6. run classification ONNX model
        label, confidence = self._run_classification(roi_image)

        # 7. generate recommendation
        recommendation = generate_recommendation(label=label, confidence=confidence)

        # encode mask to base64 PNG for frontend overlay
        mask_b64 = self._encode_mask_to_base64(mask)

        inference_time_ms = int((time.perf_counter() - start_time) * 1000)

        return {
            "mask_base64": mask_b64,
            "label": label,
            "confidence": confidence,
            "recommendation": recommendation,
            "inference_time_ms": inference_time_ms,
        }

    def _run_segmentation(self, input_tensor: np.ndarray) -> np.ndarray:
        assert self._seg_session is not None
        input_name = self._seg_session.get_inputs()[0].name
        outputs = self._seg_session.run(None, {input_name: input_tensor})
        # Expected output shape: (1, 1, H, W)
        mask_logits = outputs[0]
        mask = mask_logits[0, 0] > 0.5
        return mask.astype(np.uint8)

    def _crop_roi(self, image: Image.Image, mask: np.ndarray) -> Image.Image:
        """
        Crop the tightest bounding box around the predicted mask.
        """
        ys, xs = np.where(mask > 0)
        if ys.size == 0 or xs.size == 0:
            # Fallback to original image if mask is empty.
            return image

        x_min, x_max = xs.min(), xs.max()
        y_min, y_max = ys.min(), ys.max()
        # Ensure box is within bounds.
        x_min = max(int(x_min), 0)
        y_min = max(int(y_min), 0)
        x_max = min(int(x_max), image.width - 1)
        y_max = min(int(y_max), image.height - 1)

        return image.crop((x_min, y_min, x_max, y_max))

    def _run_classification(self, roi_image: Image.Image) -> Tuple[Label, float]:
        """
        Run the classification model on the ROI.

        The ROI is resized to 256x256 and normalised with ImageNet stats
        to match the training pipeline.
        """
        assert self._clf_session is not None

        roi_resized = resize_image(roi_image, size=(256, 256))
        roi_tensor = normalize_imagenet(roi_resized)

        input_name = self._clf_session.get_inputs()[0].name
        outputs = self._clf_session.run(None, {input_name: roi_tensor})

        # Expected output: (1, 2) logits or probabilities
        scores = outputs[0][0]
        # If not already probabilities, apply softmax.
        exp_scores = np.exp(scores - np.max(scores))
        probs = exp_scores / exp_scores.sum()

        malignant_conf = float(probs[1])
        benign_conf = float(probs[0])

        if malignant_conf >= benign_conf:
            label: Label = "malignant"
            confidence = malignant_conf
        else:
            label = "benign"
            confidence = benign_conf

        return label, round(confidence * 100.0, 2)

    @staticmethod
    def _encode_mask_to_base64(mask: np.ndarray) -> str:
        """
        Encode a 2D mask array into a base64 PNG string.
        """
        # Normalize mask to 0-255 uint8
        mask_img = Image.fromarray((mask.astype(np.uint8) * 255))
        buffer = io.BytesIO()
        mask_img.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("ascii")


_inference_service: InferenceService | None = None


def get_inference_service() -> InferenceService:
    global _inference_service
    if _inference_service is None:
        _inference_service = InferenceService()
    return _inference_service

