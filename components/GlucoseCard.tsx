import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlucoseStatus } from '../types';
import { formatTimestamp, getStatusInfo } from '../utils';
import Card from './ui/Card';

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
    <Card className="flex flex-col justify-between h-full min-h-[160px]">
      <div>
        <div className="flex items-center justify-between text-sm text-brand-text-muted mb-2">
          <span className="font-medium">{t('glucose')}</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] uppercase tracking-wider ${statusInfo.badgeStyles}`}>
            <statusInfo.Icon className="w-3 h-3" />
            {statusInfo.text}
          </span>
        </div>
        <p className={`text-5xl font-bold tracking-tight ${isAnimating ? 'animate-pulse-value' : ''} ${statusInfo.styles}`}>{glucose}</p>
        <p className="text-sm text-brand-text-muted mt-1 font-medium">{t('mgdl')}</p>
      </div>
      <div className="mt-4 border-t border-white/5 pt-2">
        <p className="text-xs text-brand-text-muted opacity-60">{formatTimestamp(timestamp)}</p>
      </div>
    </Card>
  );
};

export default GlucoseCard;
