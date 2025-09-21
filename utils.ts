import React from 'react';
import { GlucoseStatus } from './types';
import { TranslationKey } from './contexts/LocalizationContext';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from './components/icons/Icons';

export const formatTimestamp = (isoString: string): string => {
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

export const getStatusInfo = (status: GlucoseStatus, t: (key: TranslationKey) => string): { text: string; styles: string; badgeStyles: string; Icon: React.FC<{ className?: string }> } => {
    switch (status) {
      case 'High':
        return { text: t('high'), styles: 'text-red-400', badgeStyles: 'bg-red-900/50 text-red-400', Icon: ArrowUpIcon };
      case 'Slightly High':
        return { text: t('slightlyHigh'), styles: 'text-orange-400', badgeStyles: 'bg-orange-900/50 text-orange-400', Icon: ArrowUpIcon };
      case 'Normal':
        return { text: t('normal'), styles: 'text-green-400', badgeStyles: 'bg-green-900/50 text-green-400', Icon: MinusIcon };
      case 'Low':
        return { text: t('low'), styles: 'text-blue-400', badgeStyles: 'bg-blue-900/50 text-blue-400', Icon: ArrowDownIcon };
      default:
        return { text: t('normal'), styles: 'text-brand-beige', badgeStyles: 'bg-brand-dark text-brand-beige/80', Icon: MinusIcon };
    }
};

export const getStatusStyles = (status: GlucoseStatus): string => {
    switch (status) {
        case 'High': return 'bg-red-900/50 text-red-400';
        case 'Slightly High': return 'bg-orange-900/50 text-orange-400';
        case 'Normal': return 'bg-green-900/50 text-green-400';
        case 'Low': return 'bg-blue-900/50 text-blue-400';
        default: return 'bg-brand-dark text-brand-beige/80';
    }
};
