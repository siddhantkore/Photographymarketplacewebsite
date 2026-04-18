import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { API_BASE_URL } from '../services/api';

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

interface ApiAd {
  id: string;
  image: string;
  url: string;
  status: string;
  position: string;
}

// Hook to check if ads should be shown on current page
export function useGoogleAds() {
  const location = useLocation();
  const [settings, setSettings] = useState<GoogleAdSettings | null>(null);

  useEffect(() => {
    // Fetch Google Ad settings
    fetch(`${API_BASE_URL}/advertisements/google-ads/settings`)
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

// Side Rail Ad Component - uses API ads, not Google AdSense
export function SideRailAd() {
  const [ads, setAds] = useState<ApiAd[]>([]);
  const { shouldShowSideRail } = useGoogleAds();

  useEffect(() => {
    fetch(`${API_BASE_URL}/advertisements?position=side-rail&status=active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAds(data.data);
        } else {
          setAds([]);
        }
      })
      .catch(console.error);
  }, []);

  if (!shouldShowSideRail && ads.length === 0) return null;

  if (ads.length > 0) {
    return (
      <div className="sticky top-20 hidden xl:block w-40 flex-shrink-0">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.url}
            className="block overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
            target="_blank"
            rel="noreferrer"
          >
            <div className="relative h-[600px] w-[160px] bg-gray-100">
              <img src={ad.image} alt="Advertisement" className="h-full w-full object-cover" />
            </div>
          </a>
        ))}
      </div>
    );
  }

  return null;
}

// Anchor/Sticky Ad Component - uses API ads, not Google AdSense
export function AnchorAd() {
  const [ads, setAds] = useState<ApiAd[]>([]);
  const { shouldShowAnchor } = useGoogleAds();

  useEffect(() => {
    fetch(`${API_BASE_URL}/advertisements?position=anchor&status=active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAds(data.data);
        } else {
          setAds([]);
        }
      })
      .catch(console.error);
  }, []);

  // Fall back to Google AdSense if no API ads available
  if (!shouldShowAnchor && ads.length === 0) return null;

  if (ads.length > 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4">
          {ads.slice(0, 3).map((ad) => (
            <a
              key={ad.id}
              href={ad.url}
              className="block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
              target="_blank"
              rel="noreferrer"
            >
              <div className="relative h-24 w-40 bg-gray-100">
                <img src={ad.image} alt="Advertisement" className="h-full w-full object-cover" />
              </div>
            </a>
          ))}
          <div className="flex-1 text-sm text-gray-500">
            Sponsored
          </div>
        </div>
      </div>
    );
  }

  return null;
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
