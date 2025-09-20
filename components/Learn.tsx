import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Accordion, AccordionItem } from './Accordion';
import { ExclamationTriangleIcon } from './icons/Icons';

const Learn: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('diabetesGuide')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-md">{t('diabetesGuideDescription')}</p>
            </header>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                <Accordion>
                    <AccordionItem title={t('type1vs2Title')}>
                        <p>{t('type1vs2Intro')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="border-l-4 border-teal-500 pl-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Type 1 Diabetes</h4>
                                <ul>
                                    <li><strong>{t('causeLabel')}:</strong> {t('type1Cause')}</li>
                                    <li><strong>{t('onsetLabel')}:</strong> {t('type1Onset')}</li>
                                    <li><strong>{t('insulinLabel')}:</strong> {t('type1Insulin')}</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Type 2 Diabetes</h4>
                                <ul>
                                    <li><strong>{t('causeLabel')}:</strong> {t('type2Cause')}</li>
                                    <li><strong>{t('onsetLabel')}:</strong> {t('type2Onset')}</li>
                                    <li><strong>{t('insulinLabel')}:</strong> {t('type2Insulin')}</li>
                                </ul>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem title={t('monitoringTitle')}>
                        <p>{t('monitoringIntro')}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{t('dailyMonitoringTitle')}</h4>
                                <p>{t('dailyMonitoringDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{t('hba1cTitle')}</h4>
                                <p>{t('hba1cDesc')}</p>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem title={t('treatmentsTitle')}>
                         <p>{t('treatmentsIntro')}</p>
                         <ul className="mt-4 space-y-4 list-disc pl-5">
                            <li><strong>{t('lifestyleTitle')}:</strong> {t('lifestyleDesc')}</li>
                            <li><strong>{t('insulinTherapyTitle')}:</strong> {t('insulinTherapyDesc')}</li>
                            <li><strong>{t('oralMedicationTitle')}:</strong> {t('oralMedicationDesc')}</li>
                         </ul>
                    </AccordionItem>
                </Accordion>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl flex items-start gap-4 border border-yellow-200 dark:border-yellow-800">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-300">{t('disclaimerTitle')}</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{t('disclaimerText')}</p>
                </div>
            </div>
        </div>
    );
};

export default Learn;
