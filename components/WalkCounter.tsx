import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WalkingIcon, PencilIcon, XMarkIcon, FireIcon, PlayIcon, PauseIcon } from './icons/Icons';
import { getTodaysSteps, addSteps } from '../services/logService';
import Card from './ui/Card';
import { usePedometer } from '../hooks/usePedometer';

const LogStepsModal: React.FC<{ onClose: () => void; onSave: (steps: number) => void; }> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue <= 0) {
            setError(t('invalidValue'));
            return;
        }
        setError(null);
        onSave(numericValue);
    };

    return (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div 
                className="bg-brand-surface rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-5 animate-scaleIn border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-text">{t('logSteps')}</h2>
                    <button onClick={onClose} className="text-brand-text-muted hover:text-brand-text p-1">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div>
                    <label htmlFor="steps-input" className="sr-only">{t('enterNumberOfSteps')}</label>
                    <input
                        id="steps-input"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={t('enterNumberOfSteps')}
                        className="w-full p-4 text-lg bg-brand-background text-brand-text rounded-xl border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="w-full bg-brand-primary text-brand-background font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-colors shadow-lg shadow-brand-primary/20"
                    >
                        {t('addSteps')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-brand-surface-highlight text-brand-text font-semibold py-3 px-4 rounded-xl hover:bg-opacity-80 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const WalkCounter: React.FC = () => {
  const goal = 10000;
  const [steps, setSteps] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLocalization();

  // Pedometer integration
  const pedometer = usePedometer();

  useEffect(() => {
    setSteps(getTodaysSteps());
    const handleStorageChange = () => {
        setSteps(getTodaysSteps());
    };
    window.addEventListener('storageUpdated', handleStorageChange);
    return () => window.removeEventListener('storageUpdated', handleStorageChange);
  }, []);

  // When pedometer updates, add difference to total steps
  const lastPedometerSteps = useRef(0);

  useEffect(() => {
    if (pedometer.isActive) {
        const diff = pedometer.steps - lastPedometerSteps.current;
        if (diff > 0) {
            try {
                // Add these steps to storage
                const newTotal = addSteps(diff);
                setSteps(newTotal);
                lastPedometerSteps.current = pedometer.steps;
            } catch (e) {
                console.error(e);
            }
        }
    }
  }, [pedometer.steps, pedometer.isActive]);

  const toggleTracking = async () => {
    if (pedometer.isActive) {
        pedometer.stop();
    } else {
        if (!pedometer.permissionGranted) {
            await pedometer.requestPermission();
        }
        // Reset reference for this session
        lastPedometerSteps.current = 0;
        pedometer.resetSessionSteps();
        pedometer.start();
    }
  };

  const handleSaveSteps = (newSteps: number) => {
      const newTotal = addSteps(newSteps);
      setSteps(newTotal);
      setIsModalOpen(false);
  };

  const caloriesBurned = Math.round(steps * 0.04);
  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <>
      <Card className={`relative overflow-hidden transition-all duration-500 ${pedometer.isActive ? 'shadow-[0_0_20px_rgba(247,178,44,0.1)] border-brand-primary/20' : ''}`}>
         {/* Background Pulse Effect when Active */}
         {pedometer.isActive && (
            <div className="absolute inset-0 bg-brand-primary/5 animate-pulse pointer-events-none" />
         )}

        <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${pedometer.isActive ? 'bg-brand-primary text-brand-background scale-105 shadow-lg shadow-brand-primary/20' : 'bg-brand-surface-highlight text-brand-primary'}`}>
                        <WalkingIcon className={`w-6 h-6 ${pedometer.isActive ? 'animate-walk' : ''}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-brand-text">{t('steps')}</h3>
                            {pedometer.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 animate-scaleIn">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-brand-text-muted mt-1">
                            <FireIcon className="w-3.5 h-3.5 text-orange-500" />
                            <span>{caloriesBurned} {t('kcalBurned')}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-brand-text block tracking-tight">{steps.toLocaleString()}</span>
                    <span className="text-xs font-medium text-brand-text-muted uppercase tracking-wider">/ {goal.toLocaleString()}</span>
                </div>
            </div>

            {/* Session Stats (Active Mode) */}
            {pedometer.isActive && (
                <div className="mb-5 p-4 rounded-xl bg-brand-surface-highlight/50 border border-white/5 flex items-center justify-between animate-scaleIn">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-text-muted mb-0.5">Session Steps</span>
                        <div className="text-2xl font-bold text-brand-primary font-mono">{pedometer.steps}</div>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-4"></div>
                     <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-text-muted mb-0.5">Status</span>
                        <div className="text-sm font-semibold text-brand-text">Tracking</div>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="h-3 bg-brand-surface-highlight rounded-full overflow-hidden mb-6 border border-white/5">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out relative ${pedometer.isActive ? 'bg-brand-primary shadow-[0_0_10px_rgba(247,178,44,0.4)]' : 'bg-brand-primary/80'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-[1fr,auto] gap-3">
                <button
                    onClick={toggleTracking}
                    className={`group relative flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold transition-all duration-300 overflow-hidden ${
                        pedometer.isActive
                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                        : 'bg-brand-primary text-brand-background hover:brightness-110 shadow-lg shadow-brand-primary/20'
                    }`}
                    aria-label={pedometer.isActive ? t('stopTracking') : t('startTracking')}
                >
                    {pedometer.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    <span>{pedometer.isActive ? t('stopTracking') : t('startTracking')}</span>
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-14 flex items-center justify-center rounded-xl bg-brand-surface-highlight text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-highlight/80 border border-white/5 transition-all"
                    aria-label={t('logSteps')}
                >
                    <PencilIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
      </Card>
      {isModalOpen && <LogStepsModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSteps} />}
    </>
  );
};

export default WalkCounter;