/**
 * Loader Progress Styles (Dynamically Injected)
 * Article V (Security): Moved from inline <style> to JS-injected stylesheet
 * Article III (Code Quality): Programmatic style injection
 *
 * Note: This file dynamically injects loader styles into the page.
 * These styles are too complex to put in external CSS due to dynamic animations.
 */

(function injectLoaderStyles() {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* Override any conflicting base styles */
    .device-frame {
        transform: scale(0.8);
        transition: all 0.5s var(--transition-smooth);
    }

    .device-frame iframe {
        width: 100%;
        height: 100%;
        border: none;
    }

    @media (max-width: 768px) {
        .device-frame {
            transform: scale(0.6);
        }
    }

    /* Loader progress styles */
    .loader-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        width: min(420px, 80vw);
        margin-top: 20px;
        padding: 18px 20px;
        border-radius: 16px;
        background: rgba(10, 0, 32, 0.35);
        backdrop-filter: blur(14px) saturate(160%);
        -webkit-backdrop-filter: blur(14px) saturate(160%);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .progress-ring { position: relative; filter: drop-shadow(0 0 16px rgba(107,70,193,0.6)) drop-shadow(0 0 28px rgba(37,99,235,0.5)); }
    .progress-ring svg { width: 180px; height: 180px; transform: rotate(-90deg); }
    .progress-ring .ring-bg { fill: none; stroke: rgba(255,255,255,0.12); stroke-width: 12; }
    .progress-ring .ring-fill { fill: none; stroke: url(#loaderGrad); stroke-width: 12; stroke-linecap: round; }
    .progress-ring::before {
        content: '';
        position: absolute; inset: -12px;
        border-radius: 999px;
        background: conic-gradient(from 0deg, rgba(255,255,255,0.0) 0deg, rgba(107,70,193,0.35) 60deg, rgba(37,99,235,0.35) 120deg, rgba(255,255,255,0.0) 180deg);
        filter: blur(10px);
        animation: loaderSpin 2.8s linear infinite;
        pointer-events: none; mix-blend-mode: screen;
    }
    .progress-ring .percent-text {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font-family: 'BraveEightyone', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 2rem; letter-spacing: 1px; text-shadow: 0 0 10px rgba(107,70,193,0.6), 0 0 18px rgba(37,99,235,0.5);
    }
    .progress-bar { width: 100%; height: 12px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
    .progress-bar .progress-fill { position: relative; height: 100%; width: 0%; background: linear-gradient(90deg, #6B46C1, #2563EB); background-size: 200% 100%; box-shadow: 0 0 16px rgba(107,70,193,0.6); transition: width 120ms linear; animation: gradientMove 2.2s linear infinite; }
    .progress-bar .progress-fill::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(-45deg, rgba(255,255,255,0.22) 0 8px, rgba(255,255,255,0.0) 8px 16px); mix-blend-mode: overlay; animation: stripeMove 1s linear infinite; }
  `;

  document.head.appendChild(styleSheet);
})();
