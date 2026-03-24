import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../services/api';

interface Ad {
  id: string;
  image: string;
  url: string;
  status: string;
  position: string;
}

export function AdvertisementSidebar() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/advertisements?position=home-sidebar&status=active`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data)) {
          setAds(data.data);
        } else {
          setAds([]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAds([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (ads.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [ads.length]);

  const visibleAds = useMemo(() => {
    const count = Math.min(3, ads.length);
    return Array.from({ length: count }, (_, index) => ads[(startIndex + index) % ads.length]);
  }, [ads, startIndex]);

  if (!visibleAds.length) {
    return null;
  }

  return (
    <div className="sticky top-20 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Promotions</h3>
      {visibleAds.map((ad) => (
        <a
          key={ad.id}
          href={ad.url}
          className="block overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
          target="_blank"
          rel="noreferrer"
        >
          <div className="relative h-40 bg-gray-100">
            <img src={ad.image} alt="Promotion" className="h-full w-full object-cover" />
          </div>
        </a>
      ))}
    </div>
  );
}
