import React, { useState, useEffect } from 'react';
import { WalkingIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, ChartLineIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import Card from './ui/Card';
import { getGlucoseLogs } from '../services/logService';

type WalkState = 'idle' | 'walking' | 'completed';

const PredictiveCard: React.FC = () => {
  const [walkState, setWalkState] = useState<WalkState>('idle');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [prediction, setPrediction] = useState<{ trend: 'rising' | 'falling' | 'stable', text: string, urgent: boolean } | null>(null);
  const { t } = useLocalization();

  useEffect(() => {
    // Trend Analysis Logic
    const logs = getGlucoseLogs();
    if (logs.length >= 2) {
        const latest = logs[0].value;
        const previous = logs[1].value;
        const diff = latest - previous;

        let trend: 'rising' | 'falling' | 'stable' = 'stable';
        let text = t('stableTrend');
        let urgent = false;

        if (diff > 10) {
            trend = 'rising';
            text = t('risingTrend');
            if (latest > 180) urgent = true;
        } else if (diff < -10) {
            trend = 'falling';
            text = t('fallingTrend');
             if (latest < 70) urgent = true;
        }
        setPrediction({ trend, text, urgent });
    } else {
        setPrediction(null);
    }
  }, [t]);

  useEffect(() => {
    let timer: number | undefined;

    if (walkState === 'walking' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && walkState === 'walking') {
      setWalkState('completed');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [walkState, timeLeft]);

  useEffect(() => {
    if (walkState === 'completed') {
      const timer = setTimeout(() => {
        setWalkState('idle');
        setTimeLeft(15 * 60);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [walkState]);

  const handleStartWalk = () => {
    setTimeLeft(15 * 60);
    setWalkState('walking');
  };

  const handleEndWalk = () => {
    setWalkState('idle');
    setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const getTrendIcon = () => {
        if (!prediction) return null;
        if (prediction.trend === 'rising') return <ArrowUpIcon className="w-5 h-5 text-red-400" />;
        if (prediction.trend === 'falling') return <ArrowDownIcon className="w-5 h-5 text-blue-400" />;
        return <MinusIcon className="w-5 h-5 text-green-400" />;
  };

  if (walkState === 'walking') {
    return (
      <Card className="bg-brand-primary border-none shadow-brand-primary/20 flex flex-col items-center justify-center animate-fadeInUp text-brand-dark min-h-[160px]">
        <WalkingIcon className="w-12 h-12 animate-walk mb-2 text-brand-background" />
        <p className="text-4xl font-bold tracking-tighter mb-1 text-brand-background">{formatTime(timeLeft)}</p>
        <p className="text-sm font-semibold opacity-70 mb-4 text-brand-background">{t('timeRemaining')}</p>
        <button 
          onClick={handleEndWalk}
          className="bg-brand-background/10 hover:bg-brand-background/20 text-brand-background font-bold py-2 px-5 rounded-full text-sm flex items-center gap-2 transition-colors"
          aria-label={t('endWalk')}
        >
          <XMarkIcon className="w-4 h-4" />
          {t('endWalk')}
        </button>
      </Card>
    );
  }

  if (walkState === 'completed') {
    return (
      <Card className="bg-green-500 border-none flex flex-col items-center justify-center animate-fadeInUp text-white min-h-[160px]">
        <div className="animate-scaleIn flex flex-col items-center">
            <CheckIcon className="w-12 h-12 mb-2" />
            <p className="text-xl font-bold">{t('walkComplete')}</p>
            <p className="text-sm opacity-90">{t('greatJob')}</p>
        </div>
      </Card>
    );
  }
  
  // Idle state: Show Trend Insight + Walk CTA
  return (
    <Card className={`relative overflow-hidden group transition-all duration-300 hover:border-brand-primary/30 ${prediction?.urgent ? 'border border-red-500/30' : 'border border-transparent'}`}>
         {prediction?.urgent && (
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <ExclamationTriangleIcon className="w-24 h-24 text-red-500" />
            </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {/* Insight Section */}
            <div className="flex items-start gap-3 w-full sm:w-auto">
                <div className="p-2.5 bg-brand-background rounded-full shrink-0 ring-1 ring-white/5">
                    <ChartLineIcon className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-brand-text uppercase tracking-wide opacity-70 mb-1">{t('insight')}</h3>
                    {prediction ? (
                        <>
                            <div className="flex items-center gap-2 mb-0.5">
                                {getTrendIcon()}
                                <p className="text-lg font-bold text-brand-text leading-none">{prediction.text}</p>
                            </div>
                            <p className="text-xs text-brand-text-muted">{t('basedOnRecent')}</p>
                        </>
                    ) : (
                        <p className="text-sm text-brand-text-muted italic">{t('notEnoughData')}</p>
                    )}
                </div>
            </div>

            {/* Walk CTA */}
            <button
                onClick={handleStartWalk}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-5 py-3 bg-brand-background hover:bg-brand-surface-highlight text-brand-primary rounded-xl transition-all duration-200 border border-brand-primary/20 hover:border-brand-primary/50 shadow-sm"
            >
                <div className="flex flex-col items-start text-left">
                     <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-muted">{t('suggestion')}</span>
                     <span className="text-sm font-bold">{t('takeAWalk')}</span>
                </div>
                <WalkingIcon className="w-6 h-6 animate-pulse-subtle" />
            </button>
        </div>
    </Card>
  );
};

export default PredictiveCard;