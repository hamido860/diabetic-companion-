import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { formatTimestamp } from '../utils';
import Card from './ui/Card';

interface WeightCardProps {
  weight: number;
  unit: 'kg' | 'lbs';
  timestamp: string;
}

const WeightCard: React.FC<WeightCardProps> = ({ weight, unit, timestamp }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [weight]);

  return (
    <Card className="flex flex-col justify-between h-full min-h-[160px]">
      <div>
        <div className="flex items-center justify-between text-sm text-brand-text-muted mb-2">
           <span className="font-medium">{t('weight')}</span>
        </div>
        <div className="flex items-baseline gap-1">
             <p className={`text-5xl font-bold tracking-tight text-brand-text ${isAnimating ? 'animate-pulse-value' : ''}`}>{weight}</p>
             <span className="text-xl font-medium text-brand-text-muted">{unit}</span>
        </div>
      </div>
      <div className="mt-4 border-t border-white/5 pt-2">
        <p className="text-xs text-brand-text-muted opacity-60">{formatTimestamp(timestamp)}</p>
      </div>
    </Card>
  );
};

export default WeightCard;
