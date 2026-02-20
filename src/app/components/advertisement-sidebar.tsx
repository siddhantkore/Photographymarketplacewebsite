import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

interface Ad {
  id: string;
  title: string;
  description: string;
  url: string;
}

const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Monthly Pass',
    description: 'Unlimited Downloads - Save 40%',
    url: '/explore',
  },
  {
    id: '2',
    title: 'Premium Bundle',
    description: 'Get 50+ Photos for just ₹2,999',
    url: '/explore',
  },
  {
    id: '3',
    title: 'New Collection',
    description: 'Wildlife Photography Series',
    url: '/blog',
  },
];

export function AdvertisementSidebar() {
  const [currentAd1, setCurrentAd1] = useState(0);
  const [currentAd2, setCurrentAd2] = useState(1);
  const [currentAd3, setCurrentAd3] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAd1((prev) => (prev + 1) % mockAds.length);
      setCurrentAd2((prev) => (prev + 1) % mockAds.length);
      setCurrentAd3((prev) => (prev + 1) % mockAds.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const AdCard = ({ ad, index }: { ad: Ad; index: number }) => (
    <Link
      to={ad.url}
      className="block overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${ad.id}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white h-32 flex flex-col justify-center"
        >
          <div className="text-xs font-semibold mb-2 opacity-90">SPECIAL OFFER</div>
          <h4 className="font-bold text-lg mb-1">{ad.title}</h4>
          <div className="text-sm opacity-90">{ad.description}</div>
        </motion.div>
      </AnimatePresence>
    </Link>
  );

  return (
    <div className="sticky top-20 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Promotions</h3>
      
      {/* 3 rows, 1 column - as per requirements */}
      <AdCard ad={mockAds[currentAd1]} index={currentAd1} />
      <AdCard ad={mockAds[currentAd2]} index={currentAd2} />
      <AdCard ad={mockAds[currentAd3]} index={currentAd3} />
    </div>
  );
}