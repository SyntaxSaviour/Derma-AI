// // frontend/src/pages/Landing/Landing.tsx
// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Landing.css';

// const Landing: React.FC = () => {
//   const navigate   = useNavigate();
//   const [visible, setVisible]   = useState(false);
//   const [hovered, setHovered]   = useState<'user'|'doctor'|null>(null);
//   const canvasRef  = useRef<HTMLCanvasElement>(null);

//   // ── Particle canvas ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const resize = () => {
//       canvas.width  = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener('resize', resize);

//     type Particle = { x:number; y:number; vx:number; vy:number; r:number; o:number; };
//     const particles: Particle[] = Array.from({ length: 55 }, () => ({
//       x:  Math.random() * canvas.width,
//       y:  Math.random() * canvas.height,
//       vx: (Math.random() - 0.5) * 0.18,
//       vy: (Math.random() - 0.5) * 0.18,
//       r:  Math.random() * 1.6 + 0.4,
//       o:  Math.random() * 0.25 + 0.05,
//     }));

//     let raf: number;
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach(p => {
//         p.x += p.vx; p.y += p.vy;
//         if (p.x < 0) p.x = canvas.width;
//         if (p.x > canvas.width) p.x = 0;
//         if (p.y < 0) p.y = canvas.height;
//         if (p.y > canvas.height) p.y = 0;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(107,30,58,${p.o})`;
//         ctx.fill();
//       });
//       particles.forEach((a, i) => {
//         particles.slice(i+1).forEach(b => {
//           const dx = a.x-b.x, dy = a.y-b.y;
//           const dist = Math.sqrt(dx*dx + dy*dy);
//           if (dist < 110) {
//             ctx.beginPath();
//             ctx.moveTo(a.x, a.y);
//             ctx.lineTo(b.x, b.y);
//             ctx.strokeStyle = `rgba(107,30,58,${0.06*(1-dist/110)})`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         });
//       });
//       raf = requestAnimationFrame(draw);
//     };
//     draw();

//     setTimeout(() => setVisible(true), 100);

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener('resize', resize);
//     };
//   }, []);

//   return (
//     <div className="lp">
//       {/* Canvas background — fixed so it covers the whole page while scrolling */}
//       <canvas ref={canvasRef} className="lp-canvas"/>

//       {/* Warm radial glow */}
//       <div className="lp-glow"/>

//       {/* Topbar */}
//       <nav className="lp-nav">
//         <div className="lp-nav-brand">
//           <div className="lp-nav-logo">
//             <svg viewBox="0 0 16 16" fill="none">
//               <circle cx="8" cy="8" r="6" stroke="rgba(107,30,58,0.5)" strokeWidth="1.2"/>
//               <circle cx="8" cy="8" r="2.5" fill="rgba(107,30,58,0.6)"/>
//               <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" stroke="rgba(107,30,58,0.4)" strokeWidth="1" strokeLinecap="round"/>
//             </svg>
//           </div>
//           <span className="lp-nav-name">DermaAI</span>
//           <span className="lp-nav-ver">v2.1</span>
//         </div>
//         <div className="lp-nav-links">
//           <a href="#" className="lp-nav-link">About</a>
//           <a href="#" className="lp-nav-link">Research</a>
//           <a href="#" className="lp-nav-link">How it works</a>
//         </div>
//         <div className="lp-nav-right">
//           <div className="lp-status-dot"/>
//           <span className="lp-status-text">System operational</span>
//         </div>
//       </nav>

//       {/*
//         ── HERO SECTION ──────────────────────────────────────────────────────────
//         This fills exactly one viewport height. User lands here.
//         Cards are NOT rendered here — they're below.
//       */}
//       <section className={`lp-hero${visible ? ' lp-hero--visible' : ''}`}>

//         <div className="lp-tag-row">
//           <span className="lp-micro-tag">AI-Powered Dermatology</span>
//           <span className="lp-divider">·</span>
//           <span className="lp-micro-tag lp-micro-tag--muted">Research Grade</span>
//         </div>

//         <h1 className="lp-headline">
//           <span className="lp-headline-serif">Early detection</span>
//           <br/>
//           <span className="lp-headline-thin">saves lives.</span>
//         </h1>

//         <p className="lp-subheadline">
//           Clinical-grade AI analysis of dermoscopic images.<br/>
//           Segmentation, classification, and risk assessment — in under 2 seconds.
//         </p>

//         <div className="lp-metrics">
//           {[
//             { val: '0.9007', label: 'DSC Score',   sub: 'Segmentation' },
//             { val: '95.6%',  label: 'AUC-ROC',     sub: 'Classification' },
//             { val: '<2s',    label: 'Inference',    sub: 'CPU · INT8' },
//             { val: '33K+',   label: 'ISIC Images', sub: 'Training data' },
//           ].map(m => (
//             <div key={m.label} className="lp-metric">
//               <div className="lp-metric-val">{m.val}</div>
//               <div className="lp-metric-label">{m.label}</div>
//               <div className="lp-metric-sub">{m.sub}</div>
//             </div>
//           ))}
//         </div>

//         {/* Scroll hint arrow — hints the user to scroll down */}
//         <div className="lp-scroll-hint">
//           <span className="lp-scroll-hint-text">Select your portal</span>
//           <svg className="lp-scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 5v14M5 12l7 7 7-7"/>
//           </svg>
//         </div>
//       </section>

//       {/*
//         ── PORTAL SECTION ────────────────────────────────────────────────────────
//         This lives BELOW the fold. User scrolls here to pick a role.
//       */}
//       <section className="lp-portal-section">
//         <div className="lp-role-label">Select your portal to continue</div>

//         <div className="lp-cards">

//           {/* User card */}
//           <div
//             className={`lp-card lp-card--user${hovered==='user' ? ' lp-card--hovered' : ''}`}
//             onMouseEnter={() => setHovered('user')}
//             onMouseLeave={() => setHovered(null)}
//             onClick={() => navigate('/home')}
//           >
//             <div className="lp-card-inner">
//               <div className="lp-card-icon-wrap lp-card-icon-wrap--user">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
//                   <circle cx="12" cy="7" r="4"/>
//                 </svg>
//               </div>
//               <div className="lp-card-content">
//                 <div className="lp-card-eyebrow">For patients</div>
//                 <div className="lp-card-title">Patient Portal</div>
//                 <div className="lp-card-desc">Upload a dermoscopic image and receive a preliminary risk assessment with segmentation mask and clinical recommendation.</div>
//               </div>
//               <div className="lp-card-features">
//                 {['Image upload', 'Risk analysis', 'PDF report'].map(f => (
//                   <span key={f} className="lp-card-feature">{f}</span>
//                 ))}
//               </div>
//               <button className="lp-card-btn lp-card-btn--user">
//                 <span>Enter Patient Portal</span>
//                 <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
//                   <path d="M3 8h10M9 4l4 4-4 4"/>
//                 </svg>
//               </button>
//             </div>
//             <div className="lp-card-shine"/>
//           </div>

//           {/* Doctor card */}
//           <div
//             className={`lp-card lp-card--doctor${hovered==='doctor' ? ' lp-card--hovered' : ''}`}
//             onMouseEnter={() => setHovered('doctor')}
//             onMouseLeave={() => setHovered(null)}
//             onClick={() => navigate('/doctor')}
//           >
//             <div className="lp-card-inner">
//               <div className="lp-card-icon-wrap lp-card-icon-wrap--doctor">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
//                   <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
//                 </svg>
//               </div>
//               <div className="lp-card-content">
//                 <div className="lp-card-eyebrow">For clinicians</div>
//                 <div className="lp-card-title">Clinical Dashboard</div>
//                 <div className="lp-card-desc">Full clinical workspace with batch analysis, patient history, model performance metrics, and detailed segmentation results.</div>
//               </div>
//               <div className="lp-card-features">
//                 {['Analytics dashboard', 'Model metrics', 'Activity feed'].map(f => (
//                   <span key={f} className="lp-card-feature lp-card-feature--doctor">{f}</span>
//                 ))}
//               </div>
//               <button className="lp-card-btn lp-card-btn--doctor">
//                 <span>Enter Clinical Dashboard</span>
//                 <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
//                   <path d="M3 8h10M9 4l4 4-4 4"/>
//                 </svg>
//               </button>
//             </div>
//             <div className="lp-card-shine"/>
//           </div>
//         </div>

//         <p className="lp-disclaimer">
//           This tool is for informational and research purposes only and is not a substitute
//           for professional medical diagnosis or treatment.
//         </p>
//       </section>

//       {/* Bottom strip */}
//       <footer className="lp-footer">
//         <span>DermaAI v2.1 · ResUNet + EfficientNet-B0 · ISIC 2018</span>
//         <span>Research prototype · Not for clinical deployment</span>
//       </footer>
//     </div>
//   );
// };

// export default Landing;

// frontend/src/pages/Landing/Landing.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate   = useNavigate();
  const [visible, setVisible]   = useState(false);
  const [hovered, setHovered]   = useState<'user'|'doctor'|null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);

  // ── Particle canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x:number; y:number; vx:number; vy:number; r:number; o:number; };
    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r:  Math.random() * 1.6 + 0.4,
      o:  Math.random() * 0.25 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(107,30,58,${p.o})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i+1).forEach(b => {
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(107,30,58,${0.06*(1-dist/110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    setTimeout(() => setVisible(true), 100);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="lp">
      {/* Canvas background — fixed so it covers the whole page while scrolling */}
      <canvas ref={canvasRef} className="lp-canvas"/>

      {/* Warm radial glow */}
      <div className="lp-glow"/>

      {/* Topbar */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <div className="lp-nav-logo">
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="rgba(107,30,58,0.5)" strokeWidth="1.2"/>
              <circle cx="8" cy="8" r="2.5" fill="rgba(107,30,58,0.6)"/>
              <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" stroke="rgba(107,30,58,0.4)" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="lp-nav-name">DermaAI</span>
          <span className="lp-nav-ver">v2.1</span>
        </div>
        <div className="lp-nav-links">
          <a href="#" className="lp-nav-link">About</a>
          <a href="#" className="lp-nav-link">Research</a>
          <a href="#" className="lp-nav-link">How it works</a>
        </div>
        <div className="lp-nav-right">
          <div className="lp-status-dot"/>
          <span className="lp-status-text">System operational</span>
        </div>
      </nav>

      {/*
        ── HERO SECTION ──────────────────────────────────────────────────────────
        This fills exactly one viewport height. User lands here.
        Cards are NOT rendered here — they're below.
      */}
      <section className={`lp-hero${visible ? ' lp-hero--visible' : ''}`}>

        <div className="lp-tag-row">
          <span className="lp-micro-tag">AI-Powered Dermatology</span>
          <span className="lp-divider">·</span>
          <span className="lp-micro-tag lp-micro-tag--muted">Research Grade</span>
        </div>

        <h1 className="lp-headline">
          <span className="lp-headline-serif">Early detection</span>
          <br/>
          <span className="lp-headline-thin">saves lives.</span>
        </h1>

        <p className="lp-subheadline">
          Clinical-grade AI analysis of dermoscopic images.<br/>
          Segmentation, classification, and risk assessment — in under 2 seconds.
        </p>

        <div className="lp-metrics">
          {[
            { val: '0.9007', label: 'DSC Score',   sub: 'Segmentation' },
            { val: '95.6%',  label: 'AUC-ROC',     sub: 'Classification' },
            { val: '<2s',    label: 'Inference',    sub: 'CPU · INT8' },
            { val: '33K+',   label: 'ISIC Images', sub: 'Training data' },
          ].map(m => (
            <div key={m.label} className="lp-metric">
              <div className="lp-metric-val">{m.val}</div>
              <div className="lp-metric-label">{m.label}</div>
              <div className="lp-metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint arrow — hints the user to scroll down */}
        <div className="lp-scroll-hint">
          <span className="lp-scroll-hint-text">Select your portal</span>
          <svg className="lp-scroll-hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      {/*
        ── PORTAL SECTION ────────────────────────────────────────────────────────
        This lives BELOW the fold. User scrolls here to pick a role.
      */}
      <section className="lp-portal-section">
        <div className="lp-role-label">Select your portal to continue</div>

        <div className="lp-cards">

          {/* User card */}
          <div
            className={`lp-card lp-card--user${hovered==='user' ? ' lp-card--hovered' : ''}`}
            onMouseEnter={() => setHovered('user')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/home')}
          >
            <div className="lp-card-inner">
              <div className="lp-card-icon-wrap lp-card-icon-wrap--user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="lp-card-content">
                <div className="lp-card-eyebrow">For patients</div>
                <div className="lp-card-title">Patient Portal</div>
                <div className="lp-card-desc">Upload a dermoscopic image and receive a preliminary risk assessment with segmentation mask and clinical recommendation.</div>
              </div>
              <div className="lp-card-features">
                {['Image upload', 'Risk analysis', 'PDF report'].map(f => (
                  <span key={f} className="lp-card-feature">{f}</span>
                ))}
              </div>
              <button className="lp-card-btn lp-card-btn--user">
                <span>Enter Patient Portal</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
            <div className="lp-card-shine"/>
          </div>

          {/* Doctor card */}
          <div
            className={`lp-card lp-card--doctor${hovered==='doctor' ? ' lp-card--hovered' : ''}`}
            onMouseEnter={() => setHovered('doctor')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/doctor')}
          >
            <div className="lp-card-inner">
              <div className="lp-card-icon-wrap lp-card-icon-wrap--doctor">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div className="lp-card-content">
                <div className="lp-card-eyebrow">For clinicians</div>
                <div className="lp-card-title">Clinical Dashboard</div>
                <div className="lp-card-desc">Full clinical workspace with batch analysis, patient history, model performance metrics, and detailed segmentation results.</div>
              </div>
              <div className="lp-card-features">
                {['Analytics dashboard', 'Model metrics', 'Activity feed'].map(f => (
                  <span key={f} className="lp-card-feature lp-card-feature--doctor">{f}</span>
                ))}
              </div>
              <button className="lp-card-btn lp-card-btn--doctor">
                <span>Enter Clinical Dashboard</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
            <div className="lp-card-shine"/>
          </div>
        </div>

        <p className="lp-disclaimer">
          This tool is for informational and research purposes only and is not a substitute
          for professional medical diagnosis or treatment.
        </p>
      </section>

      {/* Bottom strip */}
      <footer className="lp-footer">
        <span>DermaAI v2.1 · ResUNet + EfficientNet-B0 · ISIC 2018</span>
        <span>Research prototype · Not for clinical deployment</span>
      </footer>
    </div>
  );
};

export default Landing;