import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          setStatus('online');
          setShowBanner(false);
        } else {
          setStatus('offline');
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setStatus('offline');
        setShowBanner(true);
      }
    };

    // Check immediately
    checkBackend();

    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Backend Server Not Running</p>
            <p className="text-sm text-red-100">
              Cannot connect to backend API at{' '}
              <code className="bg-red-700 px-1 py-0.5 rounded">
                http://localhost:5000
              </code>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-white hover:bg-red-700 rounded px-3 py-1 text-sm"
        >
          Dismiss
        </button>
      </div>
      <div className="max-w-7xl mx-auto mt-2 text-sm">
        <p className="text-red-100">
          <strong>Quick Fix:</strong> Open a terminal and run:
        </p>
        <code className="block bg-red-700 px-3 py-2 rounded mt-1 font-mono text-xs">
          cd backend && npm run dev
        </code>
        <p className="text-red-100 mt-1">
          📖 See{' '}
          <a
            href="/STARTUP_CHECKLIST.md"
            target="_blank"
            className="underline font-semibold"
          >
            STARTUP_CHECKLIST.md
          </a>{' '}
          for detailed setup instructions
        </p>
      </div>
    </div>
  );
}

// Minimal status indicator for footer
export function BackendStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        setStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {status === 'checking' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Checking API...</span>
        </>
      )}
      {status === 'online' && (
        <>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>API Online</span>
        </>
      )}
      {status === 'offline' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span>API Offline</span>
        </>
      )}
    </div>
  );
}
