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
                className="bg-brand-olive rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-offwhite">{t('logWeight')}</h2>
                    <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige">
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
                        className="w-full p-4 text-lg border-2 border-brand-dark bg-brand-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow shadow-sm text-brand-offwhite"
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div>
                    <span className="text-sm font-semibold text-brand-beige">{t('weightUnit')}</span>
                    <div className="mt-2 flex bg-brand-dark p-1 rounded-lg">
                        <button
                            onClick={() => setUnit('kg')}
                            className={`w-full py-2 rounded-md font-semibold text-sm transition-colors ${unit === 'kg' ? 'bg-brand-olive text-brand-yellow shadow' : 'text-brand-beige'}`}
                        >
                            {t('kg')}
                        </button>
                        <button
                            onClick={() => setUnit('lbs')}
                            className={`w-full py-2 rounded-md font-semibold text-sm transition-colors ${unit === 'lbs' ? 'bg-brand-olive text-brand-yellow shadow' : 'text-brand-beige'}`}
                        >
                            {t('lbs')}
                        </button>
                    </div>
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

export default LogWeightModal;