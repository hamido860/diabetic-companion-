import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { XMarkIcon, ExclamationTriangleIcon } from './icons/Icons';
import { resetAllLogs } from '../services/logService';

interface SettingsModalProps {
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleReset = () => {
        try {
            resetAllLogs();
            // Reload the page to reflect the changes everywhere
            window.location.reload();
        } catch (error) {
            console.error(error);
            // In a real app, you might want to show an error toast to the user
        }
    };

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div 
                className="bg-brand-olive rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-6 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-brand-offwhite">{t('settings')}</h2>
                    <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                    {!showConfirmation ? (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-brand-offwhite">{t('resetAppData')}</h3>
                            <p className="text-sm text-brand-beige/80">{t('resetDescription')}</p>
                            <button
                                onClick={() => setShowConfirmation(true)}
                                className="w-full bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {t('resetAppData')}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-red-900/30 p-4 rounded-xl text-center space-y-3">
                            <ExclamationTriangleIcon className="w-10 h-10 mx-auto text-red-400" />
                            <h4 className="text-lg font-bold text-red-300">{t('resetConfirmation')}</h4>
                            <p className="text-sm text-red-400">{t('resetWarning')}</p>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="w-full bg-brand-dark text-brand-beige font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    {t('delete')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;