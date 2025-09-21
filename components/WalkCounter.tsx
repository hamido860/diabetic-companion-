import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { WalkingIcon, PencilIcon, XMarkIcon } from './icons/Icons';
import { getTodaysSteps, addSteps } from '../services/logService';

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
                className="bg-brand-olive rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scaleIn"
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
  const [steps, setSteps] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    setSteps(getTodaysSteps());
  }, []);

  const handleSaveSteps = (stepsToAdd: number) => {
    try {
        const newTotal = addSteps(stepsToAdd);
        setSteps(newTotal);
        setIsModalOpen(false);
    } catch (error) {
        console.error(error);
        // Optionally show an error to the user
    }
  };

  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <>
      <div className="bg-brand-olive p-4 rounded-3xl shadow-lg shadow-black/20 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between text-sm text-brand-beige/80 mb-1">
            <span>{t('todaysSteps')}</span>
            <WalkingIcon className="w-5 h-5" />
          </div>
          <p className="text-5xl font-bold tracking-tight text-brand-offwhite">{steps.toLocaleString()}</p>
          <p className="text-sm text-brand-beige/80">{t('goal')} {goal.toLocaleString()}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="w-full bg-brand-dark rounded-full h-2.5">
            <div
              className="bg-brand-yellow h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors bg-brand-dark/50 hover:bg-brand-dark text-brand-yellow"
            aria-label={t('logSteps')}
          >
            <PencilIcon className="w-4 h-4" />
            <span>{t('logSteps')}</span>
          </button>
        </div>
      </div>
      {isModalOpen && <LogStepsModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSteps} />}
    </>
  );
};

export default WalkCounter;