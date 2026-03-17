// frontend/src/pages/UserHome/UserHome.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/pages/UserHome/UserHome.tsx
// Route:    /
// Layout:   Topbar + centered single column (max-width 680px)
// Sections: Hero → UploadCard → HowItWorks → TrustIndicators
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar/Topbar';
import Card from '../../components/layout/Card/Card';
import UploadZone from '../../components/layout/UploadZone/UploadZone';
import Button from '../../components/common/Buttons/Button';
import './UserHome.css';

/* ── How It Works steps ──────────────────────────────────────────────────── */
const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);
const IconDoc = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const HOW_IT_WORKS = [
  { step: '01', icon: <IconUpload />, title: 'Upload photo',       body: 'Take a clear, close-up photo of your lesion and drag it into the upload area.' },
  { step: '02', icon: <IconBrain  />, title: 'AI analyses lesion', body: 'Our two-stage AI pipeline segments the lesion boundary and classifies the region.' },
  { step: '03', icon: <IconDoc   />, title: 'Get your result',    body: 'Review your risk score, segmentation mask, and recommended next steps instantly.' },
];

const TRUST_STATS = [
  { value: '33K+',  label: 'Images trained on' },
  { value: '91.7%', label: 'AUC-ROC accuracy'  },
  { value: '<2s',   label: 'Inference time'     },
];

/* ── Page Component ──────────────────────────────────────────────────────── */

const UserHome: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // const handleAnalyse = async () => {
  //   if (!selectedFile) return;
  //   setIsLoading(true);

  //   const formData = new FormData();
  //   formData.append('file', selectedFile);

  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/analyse`, {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     if (!res.ok) throw new Error(`API error ${res.status}`);
  //     const data = await res.json();

  //     const conf = data.confidence / 100; // backend returns 0–100, store as 0–1
  //     sessionStorage.setItem('derma_result', JSON.stringify({
  //       label:             data.label,
  //       confidence:        conf,
  //       mask_base64:       data.mask_base64,
  //       originalImageUrl:  URL.createObjectURL(selectedFile),
  //       inference_time_ms: data.inference_time_ms,
  //       recommendation:    data.recommendation,
  //     }));
  //     navigate('/result');
  //   } catch {
  //     // Dev fallback — navigate with mock data
  //     sessionStorage.setItem('derma_result', JSON.stringify({
  //       label: 'malignant',
  //       confidence: 0.87,
  //       mask_base64: null,
  //       originalImageUrl: URL.createObjectURL(selectedFile),
  //       inference_time_ms: 214,
  //       dsc: 0.891,
  //       iou: 0.813,
  //       recommendation: 'Urgent referral to dermatologist recommended. Excision biopsy warranted given high malignancy probability.',
  //     }));
  //     navigate('/result');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleAnalyse = async () => {
    if (!selectedFile) return;
    console.log('🚀 Starting analysis for file:', selectedFile.name);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('📦 FormData prepared with file');

    try {
      console.log('🌐 Making API call to http://localhost:8002/api/analyse');
      const res = await fetch('http://localhost:8002/api/analyse', {
        method: 'POST',
        body: formData,
      });
      console.log('📡 API response status:', res.status);

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('✅ API response data:', data);

      // Divide confidence by 100 to store as 0-1
      const confidenceNormalized = data.confidence / 100;
      console.log('🔢 Confidence normalized:', confidenceNormalized);

      const resultData = {
        label:             data.label,
        confidence:        confidenceNormalized,
        mask_base64:       data.mask_base64,
        originalImageUrl:  URL.createObjectURL(selectedFile),
        inference_time_ms: data.inference_time_ms,
        recommendation:    data.recommendation,
      };
      console.log('💾 Storing result in sessionStorage:', resultData);

      sessionStorage.setItem('derma_result', JSON.stringify(resultData));
      console.log('🧭 Navigating to /result');
      navigate('/result');

    } catch (err) {
      console.error('❌ API call failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to analyse image: ${errMsg}\n\nPlease ensure the backend is running on port 8000.`);
    } finally {
      setIsLoading(false);
      console.log('🏁 Analysis process completed');
    }
  };
  return (
    <div className="user-home">
      <Topbar panel="user" />

      <main className="user-home__main" id="main-content">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="user-home__hero" aria-labelledby="hero-heading">
          <span className="user-home__micro-tag mono uppercase text-rose">
            AI Skin Lesion Screening
          </span>
          <h1 className="user-home__heading serif" id="hero-heading">
            Check your skin lesion<br />in seconds
          </h1>
          <p className="user-home__subheading">
            Upload a clear dermoscopic or close-up photo. Our AI model will analyse it and
            provide a preliminary risk assessment.
          </p>
          <p className="user-home__disclaimer">
            This tool is for informational purposes only and is not a substitute for
            professional medical diagnosis.
          </p>
        </section>

        {/* ── Upload Card ──────────────────────────────────────────────────── */}
        <section aria-label="Image upload">
          <Card>
            <p className="user-home__card-title">Upload your image</p>
            <UploadZone variant="large" onFileSelect={setSelectedFile} />
            <div className="user-home__analyse-wrap">
              <Button
                fullWidth
                onClick={handleAnalyse}
                disabled={!selectedFile || isLoading}
                loading={isLoading}
              >
                Analyse now
              </Button>
            </div>
          </Card>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section aria-labelledby="how-heading">
          <h2 className="user-home__section-title serif" id="how-heading">How it works</h2>
          <div className="user-home__steps">
            {HOW_IT_WORKS.map((s) => (
              <Card key={s.step}>
                <div className="user-home__step">
                  <span className="user-home__step-num mono text-rose">{s.step}</span>
                  <div className="user-home__step-icon-circle" aria-hidden="true">
                    {s.icon}
                  </div>
                  <h3 className="user-home__step-title serif">{s.title}</h3>
                  <p className="user-home__step-body">{s.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Trust Indicators ─────────────────────────────────────────────── */}
        <section className="user-home__trust" aria-label="Model statistics">
          {TRUST_STATS.map((s) => (
            <div key={s.label} className="user-home__trust-item">
              <p className="user-home__trust-value serif">{s.value}</p>
              <p className="user-home__trust-label muted">{s.label}</p>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
};

export default UserHome;
