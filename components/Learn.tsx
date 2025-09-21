import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Accordion, AccordionItem } from './Accordion';
import { ExclamationTriangleIcon } from './icons/Icons';

const Learn: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-4xl font-bold text-brand-offwhite">{t('diabetesGuide')}</h1>
                <p className="text-brand-beige/80 text-md">{t('diabetesGuideDescription')}</p>
            </header>

            <div className="bg-brand-olive p-4 sm:p-6 rounded-3xl shadow-lg shadow-black/20">
                <Accordion>
                    <AccordionItem title={t('type1vs2Title')}>
                        <p>{t('type1vs2Intro')}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="border-l-4 border-brand-yellow pl-4">
                                <h4 className="font-bold text-lg text-brand-offwhite">Type 1 Diabetes</h4>
                                <ul>
                                    <li><strong>{t('causeLabel')}:</strong> {t('type1Cause')}</li>
                                    <li><strong>{t('onsetLabel')}:</strong> {t('type1Onset')}</li>
                                    <li><strong>{t('insulinLabel')}:</strong> {t('type1Insulin')}</li>
                                </ul>
                            </div>
                            <div className="border-l-4 border-blue-400 pl-4">
                                <h4 className="font-bold text-lg text-brand-offwhite">Type 2 Diabetes</h4>
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
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('dailyMonitoringTitle')}</h4>
                                <p>{t('dailyMonitoringDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('hba1cTitle')}</h4>
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

                    <AccordionItem title={t('nutritionHacksTitle')}>
                        <p>{t('nutritionHacksIntro')}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('plateMethodTitle')}</h4>
                                <p>{t('plateMethodDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('carbCountingTitle')}</h4>
                                <p>{t('carbCountingDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('glycemicIndexTitle')}</h4>
                                <p>{t('glycemicIndexDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('fiberIsYourFriendTitle')}</h4>
                                <p>{t('fiberIsYourFriendDesc')}</p>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem title={t('exercisingSmartlyTitle')}>
                        <p>{t('exercisingSmartlyIntro')}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('bestExercisesTitle')}</h4>
                                <p>{t('bestExercisesDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('timingIsKeyTitle')}</h4>
                                <p>{t('timingIsKeyDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('monitorLevelsTitle')}</h4>
                                <p>{t('monitorLevelsDesc')}</p>
                            </div>
                        </div>
                    </AccordionItem>
                    
                    <AccordionItem title={t('stressSleepTitle')}>
                        <p>{t('stressSleepIntro')}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('stressHormonesTitle')}</h4>
                                <p>{t('stressHormonesDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('sleepDeprivationTitle')}</h4>
                                <p>{t('sleepDeprivationDesc')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-brand-offwhite">{t('managementTechniquesTitle')}</h4>
                                <p>{t('managementTechniquesDesc')}</p>
                            </div>
                        </div>
                    </AccordionItem>

                    <AccordionItem title={t('sickDaysTitle')}>
                        <p>{t('sickDaysIntro')}</p>
                        <div className="mt-4 space-y-3">
                            <p>{t('sickDayRule1')}</p>
                            <p>{t('sickDayRule2')}</p>
                            <p>{t('sickDayRule3')}</p>
                            <p>{t('sickDayRule4')}</p>
                            <p>{t('sickDayRule5')}</p>
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>
            
            <div className="bg-brand-yellow/10 p-4 rounded-xl flex items-start gap-4 border border-brand-yellow/30">
                <ExclamationTriangleIcon className="w-8 h-8 text-brand-yellow shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-brand-yellow">{t('disclaimerTitle')}</h4>
                    <p className="text-sm text-brand-yellow/80">{t('disclaimerText')}</p>
                </div>
            </div>
        </div>
    );
};

export default Learn;