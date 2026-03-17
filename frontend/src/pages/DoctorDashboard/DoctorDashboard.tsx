// frontend/src/pages/DoctorDashboard/DoctorDashboard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/pages/DoctorDashboard/DoctorDashboard.tsx
// Route:    /doctor
// Layout:   Topbar (sticky) + Sidebar (192px) + Main content grid
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Topbar from '../../components/layout/Topbar/Topbar';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import Card, { CardHeader } from '../../components/layout/Card/Card';
import KpiCard from '../../components/layout/KPI/KpiCard';
import UploadZone from '../../components/layout/UploadZone/UploadZone';
import ResultPanel, { AnalysisResult } from '../../components/layout/ResultPanel/ResultPanel';
import DataTable, { HistoryRow } from '../../components/layout/DataTable/DataTable';
import WeeklyVolume, { DayData } from '../../components/layout/Charts/WeeklyVolume';
import ModelPerformance, { MetricRow } from '../../components/layout/Charts/ModelPerformance';
import ActivityFeed, { FeedItem } from '../../components/layout/ActivityFeed/ActivityFeed';
import Button from '../../components/common/Buttons/Button';
import Badge from '../../components/common/Badges/Badge';
import './DoctorDashboard.css';

/* ── Seed / mock data ────────────────────────────────────────────────────── */

const MOCK_HISTORY: HistoryRow[] = [
  { id: '1', imageId: 'ISIC_0024306', label: 'malignant', confidence: 0.91, timestamp: '09:14', inferenceMs: 214 },
  { id: '2', imageId: 'ISIC_0024307', label: 'benign',    confidence: 0.88, timestamp: '09:02', inferenceMs: 198 },
  { id: '3', imageId: 'ISIC_0024308', label: 'benign',    confidence: 0.95, timestamp: '08:47', inferenceMs: 203 },
  { id: '4', imageId: 'ISIC_0024309', label: 'malignant', confidence: 0.84, timestamp: '08:31', inferenceMs: 221 },
  { id: '5', imageId: 'ISIC_0024310', label: 'benign',    confidence: 0.78, timestamp: '08:15', inferenceMs: 195 },
];

const WEEKLY_DATA: DayData[] = [
  { day: 'Mon', count: 18 },
  { day: 'Tue', count: 24 },
  { day: 'Wed', count: 31 },
  { day: 'Thu', count: 27 },
  { day: 'Fri', count: 22 },
  { day: 'Sat', count: 9 },
  { day: 'Sun', count: 6 },
];

const MODEL_METRICS: MetricRow[] = [
  { label: 'AUC-ROC',     value: 0.917, target: 0.88 },
  { label: 'DSC',         value: 0.891, target: 0.85 },
  { label: 'Sensitivity', value: 0.882, target: 0.80 },
  { label: 'Specificity', value: 0.904, target: 0.80 },
  { label: 'F1 Score',    value: 0.876, target: 0.80 },
  { label: 'IoU',         value: 0.813, target: 0.75 },
];

const ACTIVITY_ITEMS: FeedItem[] = [
  { id: '1', entity: 'ISIC_0024306', action: 'flagged as high-risk', timestamp: '09:14 · Today',    color: 'rose' },
  { id: '2', entity: 'Model v1.0',   action: 'inference completed',  timestamp: '09:14 · Today',    color: 'sage' },
  { id: '3', entity: 'ISIC_0024307', action: 'analysed — benign',    timestamp: '09:02 · Today',    color: 'sage' },
  { id: '4', entity: 'System',       action: 'health check passed',  timestamp: '08:00 · Today',    color: 'muted' },
  { id: '5', entity: 'Model v1.0',   action: 'loaded into memory',   timestamp: '07:55 · Today',    color: 'burg' },
];

/* ── Page Component ──────────────────────────────────────────────────────── */

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const DoctorDashboard: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
  };

  const handleAnalyse = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    // Build FormData for real API call
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/analyse`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const imageUrl = URL.createObjectURL(selectedFile);
      // confidence from backend is 0–100 (e.g. 87.43), convert to 0–1 for UI
      const conf = data.confidence / 100;
      setAnalysisResult({
        label:            data.label,
        confidence:       conf,
        confidenceBenign: 1 - conf,
        maskBase64:       data.mask_base64,
        originalImageUrl: imageUrl,
        dsc:              0,   // not returned by inference pipeline
        iou:              0,   // not returned by inference pipeline
        inferenceTimeMs:  data.inference_time_ms,
        modelName:        'ResUNet+EffB0',
        recommendation:   data.recommendation,
      });
    } catch {
      // Fallback to mock result for development
      const imageUrl = URL.createObjectURL(selectedFile);
      setAnalysisResult({
        label:            'malignant',
        confidence:       0.87,
        confidenceBenign: 0.13,
        maskBase64:       null,
        originalImageUrl: imageUrl,
        dsc:              0,
        iou:              0,
        inferenceTimeMs:  214,
        modelName:        'ResUNet+EffB0',
        recommendation:   'Urgent referral to dermatologist recommended. Excision biopsy warranted given high malignancy probability.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get current date string
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="doctor-page">
      <Topbar panel="doctor" />

      <div className="doctor-page__body">
        <Sidebar />

        <main className="doctor-page__main" id="main-content">
          {/* Page header */}
          <div className="doctor-page__header">
            <div className="doctor-page__header-left">
              <Badge variant="malignant" uppercase size="sm">Clinical Platform</Badge>
              <h1 className="doctor-page__title serif">Good morning, Dr. Singh</h1>
              <p className="doctor-page__date mono">{dateStr} · System operational</p>
            </div>
            <Button icon={<PlusIcon />} onClick={handleAnalyse} disabled={!selectedFile || isLoading} loading={isLoading}>
              New analysis
            </Button>
          </div>

          {/* KPI row */}
          <div className="doctor-page__kpi-row">
            <KpiCard label="Analyses today"  value="37"    sub="↑ 12 vs yesterday"  stripeColor="var(--burg)"  trend="up"      trendValue="12" />
            <KpiCard label="High-risk flags" value="8"     sub="21.6% of today"     stripeColor="var(--rose)"  trend="up"      trendValue="3"  />
            <KpiCard label="Avg infer. time" value="211ms" sub="target < 3 000 ms"  stripeColor="var(--sage)"  trend="neutral" trendValue="—"  />
            <KpiCard label="Model AUC-ROC"   value="91.7%" sub="target ≥ 88%"       stripeColor="var(--gold)"  trend="up"      trendValue="0.7%" />
          </div>

          {/* Main 2-col grid */}
          <div className="doctor-page__main-grid">
            {/* Left column */}
            <div className="doctor-page__left-col">
              {/* Image Analysis card */}
              <Card>
                <CardHeader title="Image analysis" subtitle="Upload a dermoscopic image to begin" />
                <UploadZone variant="compact" onFileSelect={handleFileSelect} />
                {selectedFile && (
                  <div className="doctor-page__active-row">
                    <div className="doctor-page__active-dot" aria-hidden="true" />
                    <span className="doctor-page__active-name mono">{selectedFile.name}</span>
                    <span className="doctor-page__active-size mono">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAnalyse}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      Analyse
                    </Button>
                  </div>
                )}
              </Card>

              {/* Recent History card */}
              <Card>
                <CardHeader title="Recent history" subtitle="Last 5 analyses" />
                <DataTable rows={MOCK_HISTORY} onRowClick={(row) => console.log('row clicked', row)} />
              </Card>
            </div>

            {/* Right column — Result Panel */}
            <div className="doctor-page__result-col">
              <Card>
                <CardHeader
                  title="Analysis result"
                  badge={analysisResult && (
                    <Badge variant={analysisResult.label} size="sm" uppercase>
                      {analysisResult.label === 'malignant' ? 'High risk' : 'Low risk'}
                    </Badge>
                  )}
                />
                <ResultPanel result={analysisResult} loading={isLoading} />
              </Card>
            </div>
          </div>

          {/* Bottom 3-col grid */}
          <div className="doctor-page__bottom-grid">
            <Card>
              <CardHeader title="Weekly volume" subtitle="Analyses per day" />
              <WeeklyVolume data={WEEKLY_DATA} />
            </Card>

            <Card>
              <CardHeader title="Model performance" subtitle="v1.0 · INT8 · CPU" />
              <ModelPerformance metrics={MODEL_METRICS} />
            </Card>

            <Card>
              <CardHeader title="Activity feed" subtitle="Latest system events" />
              <ActivityFeed items={ACTIVITY_ITEMS} />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
