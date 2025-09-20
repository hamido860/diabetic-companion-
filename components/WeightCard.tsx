import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WeightScaleIcon } from './icons/Icons';

interface WeightCardProps {
  weight: number;
  unit: 'kg' | 'lbs';
  timestamp: string;
}

const WeightCard: React.FC<WeightCardProps> = ({ weight, unit, timestamp }) => {
  const { t } = useLocalization();

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{t('currentWeight')}</span>
          <WeightScaleIcon className="w-5 h-5" />
        </div>
        <p className="text-5xl font-bold tracking-tight text-gray-800 dark:text-white">{weight}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{unit}</p>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
};

export default WeightCard;
