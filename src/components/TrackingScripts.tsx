import { useEffect } from "react";

const STORAGE_KEY = "festanca_tracking";

export interface TrackingConfig {
  facebookPixelId: string;
  googleTagId: string;
}

export function getTrackingConfig(): TrackingConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore parse errors - return defaults */ }
  return { facebookPixelId: "", googleTagId: "" };
}

export function saveTrackingConfig(config: TrackingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Strict ID validation prevents XSS via localStorage tampering.
// Facebook Pixel IDs are 15-16 digit numbers; GA/GTM IDs are e.g. G-XXXXXXX, UA-XXXXX-Y, GT-XXXXXXX, AW-XXXXXXXXX.
const FB_PIXEL_RE = /^[0-9]{6,20}$/;
const GTAG_RE = /^[A-Z]{1,3}-[A-Z0-9-]{4,30}$/;

const TrackingScripts = () => {
  useEffect(() => {
    const config = getTrackingConfig();

    // Facebook Pixel
    if (config.facebookPixelId && FB_PIXEL_RE.test(config.facebookPixelId)) {
      const safeId = config.facebookPixelId;
      const existingFb = document.getElementById("fb-pixel-script");
      if (!existingFb) {
        const initScript = document.createElement("script");
        initScript.id = "fb-pixel-script";
        initScript.textContent = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${safeId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(initScript);

        // Noscript fallback (use safe DOM construction)
        const noscript = document.createElement("noscript");
        noscript.id = "fb-pixel-noscript";
        const img = document.createElement("img");
        img.height = 1;
        img.width = 1;
        img.style.display = "none";
        img.src = `https://www.facebook.com/tr?id=${encodeURIComponent(safeId)}&ev=PageView&noscript=1`;
        noscript.appendChild(img);
        document.body.appendChild(noscript);
      }
    }

    // Google Tag (gtag.js)
    if (config.googleTagId && GTAG_RE.test(config.googleTagId)) {
      const safeId = config.googleTagId;
      const existingGtag = document.getElementById("gtag-script");
      if (!existingGtag) {
        const gtagScript = document.createElement("script");
        gtagScript.id = "gtag-script";
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(safeId)}`;
        document.head.appendChild(gtagScript);

        const gtagInit = document.createElement("script");
        gtagInit.id = "gtag-init-script";
        gtagInit.textContent = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${safeId}');
        `;
        document.head.appendChild(gtagInit);
      }
    }
  }, []);

  return null;
};

export default TrackingScripts;