import { useEffect } from 'react';

// Replace with your actual Google Ads/Analytics ID
const GTAG_ID = 'AW-17295628369';

function useLoadAdsScript() {
  useEffect(() => {
    // Adblocker detection
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.height = '10px';
    document.body.appendChild(testAd);
    window.setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        // Adblocker is enabled, don't load ads/analytics
        console.log('Adblocker detected, not loading ads/analytics.');
      } else {
        // No adblocker, safe to load ads/analytics
        // Google Tag Manager/Analytics script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
        script.async = true;
        document.body.appendChild(script);

        // Inline gtag config
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GTAG_ID}');
        `;
        document.body.appendChild(inlineScript);
      }
      document.body.removeChild(testAd);
    }, 100);
  }, []);
}

export default useLoadAdsScript; 