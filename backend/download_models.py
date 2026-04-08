import os
import sys
from pathlib import Path


def download_models() -> None:
    hf_repo_id = os.getenv("HF_REPO_ID")
    hf_token   = os.getenv("HF_TOKEN")

    if not hf_repo_id:
        print("[download_models] HF_REPO_ID not set — skipping download.")
        return

    seg_path = Path(os.getenv("SEGMENTATION_MODEL_PATH",   "artefacts/models/segmentation.onnx"))
    clf_path = Path(os.getenv("CLASSIFICATION_MODEL_PATH", "artefacts/models/classification.onnx"))

    # If both files already exist, skip download
    if seg_path.exists() and clf_path.exists():
        print("[download_models] Models already present — skipping download.")
        return

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("[download_models] huggingface_hub not installed — cannot download models.")
        sys.exit(1)

    seg_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"[download_models] Downloading from {hf_repo_id} ...")

    if not seg_path.exists():
        hf_hub_download(
            repo_id=hf_repo_id,
            filename="segmentation.onnx",
            local_dir=str(seg_path.parent),
            token=hf_token,
        )
        print(f"[download_models] segmentation.onnx -> {seg_path}")

    if not clf_path.exists():
        hf_hub_download(
            repo_id=hf_repo_id,
            filename="classification.onnx",
            local_dir=str(clf_path.parent),
            token=hf_token,
        )
        print(f"[download_models] classification.onnx -> {clf_path}")

    print("[download_models] Done.")


if __name__ == "__main__":
    download_models()