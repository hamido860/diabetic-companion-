import React, { useState, useEffect } from 'react';
import { WalkingIcon, CheckIcon, XMarkIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

type WalkState = 'idle' | 'walking' | 'completed';

const PredictiveCard: React.FC = () => {
  const [walkState, setWalkState] = useState<WalkState>('idle');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const { t } = useLocalization();

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

  if (walkState === 'walking') {
    return (
      <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-6 rounded-2xl shadow-lg w-full text-white flex flex-col items-center justify-center animate-fadeInUp">
        <WalkingIcon className="w-16 h-16 animate-walk mb-2" />
        <p className="text-5xl font-bold tracking-tighter mb-1">{formatTime(timeLeft)}</p>
        <p className="text-md opacity-80 mb-4">{t('timeRemaining')}</p>
        <button 
          onClick={handleEndWalk}
          className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-5 rounded-full text-sm flex items-center gap-2 transition-colors"
          aria-label={t('endWalk')}
        >
          <XMarkIcon className="w-4 h-4" />
          {t('endWalk')}
        </button>
      </div>
    );
  }

  if (walkState === 'completed') {
    return (
      <div className="bg-gradient-to-br from-teal-500 to-green-500 p-6 rounded-2xl shadow-lg w-full text-white flex flex-col items-center justify-center animate-fadeInUp">
        <div className="animate-scaleIn flex flex-col items-center">
            <CheckIcon className="w-12 h-12 mb-2" />
            <p className="text-xl font-bold">{t('walkComplete')}</p>
            <p className="text-sm opacity-90">{t('greatJob')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <button 
      onClick={handleStartWalk}
      className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 w-full text-start flex items-center justify-between transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-400"
      aria-label="Start a 15 minute walk to prevent a glucose spike"
    >
      <div className="flex items-center space-x-4">
        <div className="bg-orange-100 dark:bg-orange-900/50 p-3.5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{t('mediumRiskSpike')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('predictedIn')}</p>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-1 text-teal-600 dark:text-teal-400">
          <WalkingIcon className="w-8 h-8" />
          <span className="font-bold text-xs uppercase tracking-wider">{t('takeAWalk')}</span>
      </div>
    </button>
  );
};

export default PredictiveCard;
