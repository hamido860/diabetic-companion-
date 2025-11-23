import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WalkingIcon, PencilIcon, XMarkIcon } from './icons/Icons';
import { useStepTracker } from '../hooks/useStepTracker';

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
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div 
                className="bg-brand-olive rounded-md shadow-xl w-full max-w-sm p-6 space-y-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-offwhite">{t('logSteps')}</h2>
                    <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige">
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
                        className="w-full p-4 text-lg border-2 border-brand-dark bg-brand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow shadow-sm"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="w-full bg-brand-yellow text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        {t('addSteps')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-brand-dark text-brand-beige font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const WalkCounter: React.FC = () => {
  const goal = 8000;
  const { steps, manualAddSteps, isNative } = useStepTracker();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLocalization();

  const handleSaveSteps = (stepsToAdd: number) => {
    try {
        manualAddSteps(stepsToAdd);
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
    }
  };

  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <>
      <div className="bg-brand-olive p-4 rounded-md shadow-lg shadow-black/20 flex flex-col justify-between h-full relative overflow-hidden">
        {/* Animated background effect for emphasis if goal reached or high activity */}
        {progress > 80 && <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none animate-pulse-subtle" />}

        <div>
          <div className="flex items-center justify-between text-sm text-brand-beige/80 mb-2">
            <span className="font-medium">{t('todaysSteps')}</span>
            <WalkingIcon className={`w-5 h-5 opacity-80 ${progress > 0 ? 'animate-walk text-brand-yellow' : ''}`} />
          </div>
          <div className="flex items-baseline gap-2">
             <p className="text-4xl font-bold tracking-tight text-brand-offwhite">{steps.toLocaleString()}</p>
             <p className="text-sm text-brand-beige/80 font-medium">/ {goal.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="w-full bg-brand-dark rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-yellow h-2.5 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
                 {/* Shimmer effect on progress bar */}
                 <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          {!isNative && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors bg-brand-dark/50 hover:bg-brand-dark text-brand-yellow"
                aria-label={t('logSteps')}
              >
                <PencilIcon className="w-4 h-4" />
                <span>{t('logSteps')}</span>
              </button>
          )}
          {isNative && (
             <p className="text-xs text-center text-brand-beige/50">
                 {t('autoTrackingActive') || "Auto-tracking active"}
             </p>
          )}
        </div>
      </div>
      {isModalOpen && <LogStepsModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSteps} />}
    </>
  );
};

export default WalkCounter;