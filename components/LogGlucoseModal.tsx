import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { XMarkIcon } from './icons/Icons';

interface LogGlucoseModalProps {
    onClose: () => void;
    onSave: (value: number) => void;
}

const LogGlucoseModal: React.FC<LogGlucoseModalProps> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const numericValue = parseFloat(value);
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
                    <h2 className="text-2xl font-bold text-brand-offwhite">{t('logYourGlucose')}</h2>
                    <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div>
                    <label htmlFor="glucose-input" className="sr-only">{t('enterValue')}</label>
                    <input
                        id="glucose-input"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={t('enterValue')}
                        className="w-full p-4 text-lg border-2 border-brand-dark bg-brand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow shadow-sm text-brand-offwhite"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/10">
                    <button
                        onClick={handleSave}
                        className="w-full bg-brand-yellow text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        {t('save')}
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

export default LogGlucoseModal;