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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('logSteps')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
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
                        className="w-full p-4 text-lg border-2 border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={handleSave}
                        className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        {t('addSteps')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>{t('todaysSteps')}</span>
            <WalkingIcon className="w-5 h-5" />
          </div>
          <p className="text-5xl font-bold tracking-tight text-gray-800 dark:text-white">{steps.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('goal')} {goal.toLocaleString()}</p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors bg-teal-50 hover:bg-teal-100 dark:bg-gray-700 text-teal-600 dark:text-teal-400 dark:hover:bg-gray-600"
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
