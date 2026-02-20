import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

interface GoogleAdSettings {
  adClientId: string;
  enableVignette: boolean;
  enableSideRail: boolean;
  enableAnchor: boolean;
  vignettePlaces: string[];
  sideRailPlaces: string[];
  anchorPlaces: string[];
  excludedPages: string[];
}

// Hook to check if ads should be shown on current page
export function useGoogleAds() {
  const location = useLocation();
  const [settings, setSettings] = useState<GoogleAdSettings | null>(null);

  useEffect(() => {
    // Fetch Google Ad settings
    fetch('/api/v1/advertisements/google-ads/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const isExcluded = (path: string) => {
    if (!settings) return true;
    return settings.excludedPages.some((excluded) => path.includes(excluded));
  };

  const shouldShowVignette = () => {
    if (!settings?.enableVignette || isExcluded(location.pathname)) return false;
    return settings.vignettePlaces.some((place) => location.pathname === place);
  };

  const shouldShowSideRail = () => {
    if (!settings?.enableSideRail || isExcluded(location.pathname)) return false;
    return settings.sideRailPlaces.some(
      (place) => location.pathname === place || location.pathname.startsWith(place)
    );
  };

  const shouldShowAnchor = () => {
    if (!settings?.enableAnchor || isExcluded(location.pathname)) return false;
    return settings.anchorPlaces.some(
      (place) => location.pathname === place || location.pathname.startsWith(place)
    );
  };

  return {
    settings,
    shouldShowVignette: shouldShowVignette(),
    shouldShowSideRail: shouldShowSideRail(),
    shouldShowAnchor: shouldShowAnchor(),
  };
}

// Vignette Ad Component
export function VignetteAd() {
  const { settings, shouldShowVignette } = useGoogleAds();

  useEffect(() => {
    if (!shouldShowVignette || !settings?.adClientId) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Vignette ad error:', error);
    }
  }, [shouldShowVignette, settings]);

  if (!shouldShowVignette || !settings?.adClientId) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={settings.adClientId}
      data-ad-slot="vignette"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

// Side Rail Ad Component
export function SideRailAd() {
  const { settings, shouldShowSideRail } = useGoogleAds();

  useEffect(() => {
    if (!shouldShowSideRail || !settings?.adClientId) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Side rail ad error:', error);
    }
  }, [shouldShowSideRail, settings]);

  if (!shouldShowSideRail || !settings?.adClientId) return null;

  return (
    <div className="sticky top-20 hidden xl:block">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '160px', height: '600px' }}
        data-ad-client={settings.adClientId}
        data-ad-slot="side-rail"
        data-ad-format="vertical"
      />
    </div>
  );
}

// Anchor/Sticky Ad Component
export function AnchorAd() {
  const { settings, shouldShowAnchor } = useGoogleAds();

  useEffect(() => {
    if (!shouldShowAnchor || !settings?.adClientId) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Anchor ad error:', error);
    }
  }, [shouldShowAnchor, settings]);

  if (!shouldShowAnchor || !settings?.adClientId) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', height: '90px' }}
        data-ad-client={settings.adClientId}
        data-ad-slot="anchor"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Google Ads Script Loader
export function GoogleAdsScript() {
  const { settings } = useGoogleAds();

  useEffect(() => {
    if (!settings?.adClientId) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adClientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [settings]);

  return null;
}
