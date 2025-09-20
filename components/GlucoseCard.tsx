import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from './icons/Icons';
import { GlucoseStatus } from '../types';

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

  const getStatusInfo = (): { text: string; styles: string; badgeStyles: string; Icon: React.FC<{ className?: string }> } => {
    switch (status) {
      case 'High':
        return { text: t('high'), styles: 'text-red-600 dark:text-red-400', badgeStyles: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400', Icon: ArrowUpIcon };
      case 'Slightly High':
        return { text: t('slightlyHigh'), styles: 'text-orange-500 dark:text-orange-400', badgeStyles: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400', Icon: ArrowUpIcon };
      case 'Normal':
        return { text: t('normal'), styles: 'text-green-600 dark:text-green-400', badgeStyles: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400', Icon: MinusIcon };
      case 'Low':
        return { text: t('low'), styles: 'text-blue-600 dark:text-blue-400', badgeStyles: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400', Icon: ArrowDownIcon };
      default:
        return { text: t('normal'), styles: 'text-gray-600 dark:text-gray-400', badgeStyles: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', Icon: MinusIcon };
    }
  };

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

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{t('glucose')}</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-xs ${statusInfo.badgeStyles}`}>
            <statusInfo.Icon className="w-3 h-3" />
            {statusInfo.text}
          </span>
        </div>
        <p className={`text-5xl font-bold tracking-tight ${isAnimating ? 'animate-pulse-value' : ''} ${statusInfo.styles}`}>{glucose}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('mgdl')}</p>
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(timestamp)}</p>
      </div>
    </div>
  );
};

export default GlucoseCard;
