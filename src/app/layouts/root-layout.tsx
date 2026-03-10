import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { Toaster } from '../components/ui/sonner';
import { GoogleAdsScript, AnchorAd } from '../components/google-ads';
import { BackendStatus } from '../components/backend-status';

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <GoogleAdsScript />
      <BackendStatus />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AnchorAd />
      <Toaster />
    </div>
  );
}