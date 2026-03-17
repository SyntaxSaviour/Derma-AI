// frontend/src/pages/UserResult/UserResult.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/pages/UserResult/UserResult.tsx
// Route:    /result
// Reads result from sessionStorage key 'derma_result' set by UserHome
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/layout/Topbar/Topbar';
import Card from '../../components/layout/Card/Card';
import Badge from '../../components/common/Badges/Badge';
import Button from '../../components/common/Buttons/Button';
import ResultPanel, { AnalysisResult } from '../../components/layout/ResultPanel/ResultPanel';
import './UserResult.css';

/* ── Next steps config ─────────────────────────────────────────────────── */
const NEXT_STEPS = {
  malignant: [
    { color: 'rose' as const, text: 'Book an urgent dermatologist appointment within the next 2 weeks.' },
    { color: 'rose' as const, text: 'Do not scratch, pick, or apply any substances to the lesion.' },
    { color: 'burg' as const, text: 'Take additional photos from different angles for your dermatologist.' },
    { color: 'burg' as const, text: 'Review your family history of skin cancer and share it with your doctor.' },
  ],
  benign: [
    { color: 'sage' as const, text: 'Continue regular skin self-checks every 4–6 weeks.' },
    { color: 'sage' as const, text: 'Book a routine dermatology review if you have not had one in the past year.' },
    { color: 'burg' as const, text: 'Monitor for any changes in size, colour, or texture.' },
    { color: 'muted' as const, text: 'Apply broad-spectrum SPF 50+ sunscreen daily.' },
  ],
};

const stepColorMap: Record<string, string> = {
  rose: 'var(--rose)',
  sage: 'var(--sage)',
  burg: 'var(--burg)',
  muted: 'var(--muted3)',
};

/* ── PDF download placeholder ────────────────────────────────────────────── */
const handleDownloadPdf = () => {
  // TODO: hook into pdf/ component in Phase 8
  alert('PDF download will be implemented in Phase 8 (pdf/ component).');
};

/* ── Page Component ──────────────────────────────────────────────────────── */

const UserResult: React.FC = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('derma_result');
    if (!raw) { navigate('/'); return; }
    try {
      const data = JSON.parse(raw);
      setResult({
        label:            data.label,
        confidence:       data.confidence,       // already 0–1 (converted in UserHome)
        confidenceBenign: 1 - (data.confidence ?? 0),
        maskBase64:       data.mask_base64 ?? null,
        originalImageUrl: data.originalImageUrl ?? null,
        dsc:              0,   // not returned by inference pipeline
        iou:              0,   // not returned by inference pipeline
        inferenceTimeMs:  data.inference_time_ms ?? 0,
        modelName:        'ResUNet+EffB0',
        recommendation:   data.recommendation ?? '',
      });
    } catch {
      navigate('/');
    }
  }, [navigate]);

  if (!result) return null;

  const isMalignant = result.label === 'malignant';
  const accentColor = isMalignant ? 'var(--rose)' : 'var(--sage)';
  const steps = isMalignant ? NEXT_STEPS.malignant : NEXT_STEPS.benign;

  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="user-result">
      <Topbar panel="user" />

      <main className="user-result__main" id="main-content">

        {/* ── Section 1: Result Header ───────────────────────────────────── */}
        <section className="user-result__header-section">
          <button
            className="user-result__back mono"
            onClick={() => navigate('/')}
            aria-label="Go back to upload page"
          >
            ← Analyse another image
          </button>

          <Badge
            variant={isMalignant ? 'malignant' : 'benign'}
            uppercase
            size="sm"
          >
            Analysis complete
          </Badge>

          <h1 className="user-result__heading serif">Your result is ready</h1>

          <p
            className="user-result__timestamp mono"
            aria-label={`Analysed at ${timestamp}`}
          >
            Analysed {timestamp}
          </p>
        </section>

        {/* ── Section 2: Result Card ─────────────────────────────────────── */}
        <section aria-label="Analysis result details">
          <Card>
            <ResultPanel result={result} />
          </Card>
        </section>

        {/* ── Section 3: Understanding your result ──────────────────────── */}
        <section aria-labelledby="understanding-heading">
          <Card>
            <h2
              className="user-result__card-heading serif"
              id="understanding-heading"
            >
              Understanding your result
            </h2>
            <div className="user-result__explanation">
              <p>
                The AI model analysed your image in two stages: first it drew a precise
                boundary around the lesion (segmentation), then it classified the enclosed
                region as{' '}
                <strong style={{ color: accentColor }}>
                  {isMalignant ? 'malignant' : 'benign'}
                </strong>{' '}
                with a confidence of{' '}
                <strong>{((isMalignant ? result.confidence : result.confidenceBenign) * 100).toFixed(1)}%</strong>.
              </p>
              <p>
                The <strong>DSC score</strong> of{' '}
                <span className="mono">{result.dsc.toFixed(3)}</span> measures how
                accurately the AI traced the lesion boundary — a score above 0.85 is
                considered excellent.
              </p>
              <p>
                <strong>Confidence</strong> reflects how certain the model is about its
                classification. A score above 80% indicates a strong signal, but this
                tool does not replace a clinical diagnosis.
              </p>
            </div>
          </Card>
        </section>

        {/* ── Section 4: Next Steps ─────────────────────────────────────── */}
        <section aria-labelledby="steps-heading">
          <Card>
            <h2
              className="user-result__card-heading serif"
              id="steps-heading"
            >
              Recommended next steps
            </h2>
            <ol className="user-result__steps">
              {steps.map((s, i) => (
                <li key={i} className="user-result__step">
                  <span
                    className="user-result__step-num mono"
                    style={{ color: stepColorMap[s.color] }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p
                    className="user-result__step-text"
                    style={i === 0 ? { color: stepColorMap[s.color], fontWeight: 600 } : {}}
                  >
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="user-result__ctas">
              <Button variant="secondary" onClick={handleDownloadPdf}>
                Download PDF report
              </Button>
              <Button onClick={() => navigate('/')}>
                Analyse another image
              </Button>
            </div>
          </Card>
        </section>

      </main>
    </div>
  );
};

export default UserResult;
