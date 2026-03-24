import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

interface InlineAdCardProps {
  position: number; // Position in the grid (e.g., after 6th product)
}

interface Advertisement {
  id: string;
  image: string;
  url: string;
  status: string;
  position: string;
  gridIndex: number | null;
}

export function InlineAdCard({ position }: InlineAdCardProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    // Fetch inline ads for product grid
    fetch(`${API_BASE_URL}/advertisements?position=product-grid&status=active`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          // Find ad that matches this position or get first available
          const matchingAd = data.data.find((a: Advertisement) => a.gridIndex === position);
          setAd(matchingAd || data.data[0]);
        } else {
          setAd(null);
        }
      })
      .catch(console.error);
  }, [position]);

  if (!ad) return null;

  return (
    <a
      href={ad.url}
      className="block group rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/5]">
        <img
          src={ad.image}
          alt="Advertisement"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Sponsored
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 text-center">
          Click to learn more →
        </p>
      </div>
    </a>
  );
}
