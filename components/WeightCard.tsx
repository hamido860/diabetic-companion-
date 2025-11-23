import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WeightScaleIcon } from './icons/Icons';
import { formatTimestamp } from '../utils';

interface WeightCardProps {
  weight: number;
  unit: 'kg' | 'lbs';
  timestamp: string;
}

const WeightCard: React.FC<WeightCardProps> = ({ weight, unit, timestamp }) => {
  const { t } = useLocalization();

  return (
    <div className="bg-brand-olive p-4 rounded-md shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-sm text-brand-beige/80 mb-2">
          <span className="font-medium">{t('currentWeight')}</span>
          <WeightScaleIcon className="w-5 h-5 opacity-80" />
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-bold tracking-tight text-brand-offwhite">{weight}</p>
          <p className="text-sm text-brand-beige/80 font-medium">{unit}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-brand-beige/10">
        <p className="text-xs text-brand-beige/60">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
};

export default WeightCard;
