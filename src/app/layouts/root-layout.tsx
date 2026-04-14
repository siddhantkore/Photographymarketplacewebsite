import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Toaster } from '../components/ui/sonner';
import { GoogleAdsScript, AnchorAd } from '../components/google-ads';
import { BackendStatus } from '../components/backend-status';
import { ScrollToTop } from '../components/scroll-to-top';
import { AnimatedBackground } from '../components/animated-background';

export function RootLayout() {
  const location = useLocation();

  // Exclude visible ads from transactional/account pages to preserve trust and focus
  const noAdPaths = [
    /^\/login/,
    /^\/register/,
    /^\/verify-email/,
    /^\/forgot-password/,
    /^\/cart/,
    /^\/checkout/,
    /^\/orders/,
    /^\/profile/,
  ];
  const showAds = !noAdPaths.some((pattern) => pattern.test(location.pathname));

  return (
    <div className="relative flex flex-col min-h-screen">
      <AnimatedBackground />
      <div className="relative z-[1] flex flex-col min-h-screen">
        {/* Always load ad script so Google AdSense is initialized */}
        <GoogleAdsScript />
        <BackendStatus />
        <ScrollToTop />
        <Header />
        <main className="flex-1 bg-transparent">
          <Outlet />
        </main>
        <Footer />
        {/* Only show visible ad components on non-transactional pages */}
        {showAds && <AnchorAd />}
        <Toaster />
      </div>
    </div>
  );
}