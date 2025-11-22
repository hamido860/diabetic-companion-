import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WalkingIcon, PencilIcon, XMarkIcon, FireIcon } from './icons/Icons';
import { getTodaysSteps, addSteps } from '../services/logService';
import Card from './ui/Card';

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

  useEffect(() => {
    setSteps(getTodaysSteps());
    // Listen for storage updates to keep steps in sync
    const handleStorageChange = () => {
        setSteps(getTodaysSteps());
    };
    window.addEventListener('storageUpdated', handleStorageChange);
    return () => window.removeEventListener('storageUpdated', handleStorageChange);
  }, []);

  const handleSaveSteps = (stepsToAdd: number) => {
    try {
        const newTotal = addSteps(stepsToAdd);
        setSteps(newTotal);
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
    }
  };

  const caloriesBurned = Math.round(steps * 0.04);
  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <>
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-background rounded-full text-brand-primary ring-1 ring-white/5">
                    <WalkingIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-brand-text leading-tight">{t('steps')}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-brand-text-muted mt-0.5">
                        <FireIcon className="w-3 h-3 text-orange-500" />
                        <span>{caloriesBurned} {t('kcalBurned')}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <span className="text-2xl font-bold text-brand-text block leading-none">{steps.toLocaleString()}</span>
                <span className="text-xs text-brand-text-muted">/ {goal.toLocaleString()}</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 bg-brand-background rounded-full overflow-hidden mb-5 border border-white/5">
            <div
                className="h-full bg-brand-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(247,178,44,0.3)]"
                style={{ width: `${progress}%` }}
            />
        </div>

        <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 px-4 rounded-xl transition-all duration-200 bg-brand-background hover:bg-brand-surface-highlight text-brand-primary border border-brand-primary/20 hover:border-brand-primary/40"
            aria-label={t('logSteps')}
        >
            <PencilIcon className="w-4 h-4" />
            <span>{t('logSteps')}</span>
        </button>
      </Card>
      {isModalOpen && <LogStepsModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSteps} />}
    </>
  );
};

export default WalkCounter;