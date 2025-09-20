import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { XMarkIcon } from './icons/Icons';

interface LogWeightModalProps {
    onClose: () => void;
    onSave: (value: number, unit: 'kg' | 'lbs') => void;
}

const LogWeightModal: React.FC<LogWeightModalProps> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [value, setValue] = useState('');
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue <= 0) {
            setError(t('invalidValue'));
            return;
        }
        setError(null);
        onSave(numericValue, unit);
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('logWeight')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div>
                    <label htmlFor="weight-input" className="sr-only">{t('enterYourWeight')}</label>
                    <input
                        id="weight-input"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={t('enterYourWeight')}
                        className="w-full p-4 text-lg border-2 border-gray-200 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('weightUnit')}</span>
                    <div className="mt-2 flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => setUnit('kg')}
                            className={`w-full py-2 rounded-md font-semibold text-sm transition-colors ${unit === 'kg' ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-500'}`}
                        >
                            {t('kg')}
                        </button>
                        <button
                            onClick={() => setUnit('lbs')}
                            className={`w-full py-2 rounded-md font-semibold text-sm transition-colors ${unit === 'lbs' ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow' : 'text-gray-500'}`}
                        >
                            {t('lbs')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleSave}
                        className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        {t('save')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogWeightModal;