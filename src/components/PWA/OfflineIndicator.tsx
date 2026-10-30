import React, { useState, useEffect } from 'react';
import { WifiOff, Radio } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 border border-amber-300 px-3 py-1.5 text-xs font-mono font-bold text-black shadow-lg backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Studio Mode — In-Memory Audio Active</span>
    </div>
  );
};
