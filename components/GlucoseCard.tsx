import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlucoseStatus } from '../types';
import { formatTimestamp, getStatusInfo } from '../utils';

interface GlucoseCardProps {
  glucose: number;
  status: GlucoseStatus;
  timestamp: string;
}

const GlucoseCard: React.FC<GlucoseCardProps> = ({ glucose, status, timestamp }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [glucose]);

  const statusInfo = getStatusInfo(status, t);

  return (
    <div className="bg-brand-olive p-4 rounded-md shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-sm text-brand-beige/80 mb-2">
          <span className="font-medium">{t('glucose')}</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-xs ${statusInfo.badgeStyles}`}>
            <statusInfo.Icon className="w-3 h-3" />
            {statusInfo.text}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <p className={`text-4xl font-bold tracking-tight ${isAnimating ? 'animate-pulse-value' : ''} ${statusInfo.styles}`}>{glucose}</p>
          <p className="text-sm text-brand-beige/80 font-medium">{t('mgdl')}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-brand-beige/10">
        <p className="text-xs text-brand-beige/60">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
};

export default GlucoseCard;
