import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { getTodaysIntake, deleteLoggedItem } from '../services/logService';
import { LoggedItem } from '../types';
import { CubeIcon, SteakIcon, DropletIcon, FireIcon, TrashIcon } from './icons/Icons';
import { DAILY_GOALS } from '../constants';

const NutrientProgress: React.FC<{ label: string; value: number; goal: number; Icon: React.FC<{ className?: string }>; color: string }> = ({ label, value, goal, Icon, color }) => {
    const { t } = useLocalization();
    const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
    
    const colorStylesMap: { [key: string]: { text: string, bg: string } } = {
        teal: { text: 'text-brand-yellow', bg: 'bg-brand-yellow' },
        blue: { text: 'text-blue-400', bg: 'bg-blue-500' },
        yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400' },
        orange: { text: 'text-orange-400', bg: 'bg-orange-500' },
    };

    const styles = colorStylesMap[color];
    const unit = label === t('calories') ? '' : 'g';

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${styles.text}`} />
                    <span className={`font-semibold ${styles.text}`}>{label}</span>
                </div>
                <span className="font-semibold text-brand-beige/80">{Math.round(value)}{unit} / {goal}{unit}</span>
            </div>
            <div className="w-full bg-brand-dark rounded-full h-2">
                <div className={`${styles.bg} h-2 rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const DailyIntakeTracker: React.FC = () => {
    const { t } = useLocalization();
    const [intake, setIntake] = useState<{ loggedItems: LoggedItem[], totals: Omit<LoggedItem, 'id' | 'name' | 'loggedAt' | 'confidence'> } | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadIntake = () => {
        setIntake(getTodaysIntake());
    };

    useEffect(() => {
        loadIntake();
        window.addEventListener('storageUpdated', loadIntake);
        return () => window.removeEventListener('storageUpdated', loadIntake);
    }, []);
    
    const handleDeleteItem = (id: string) => {
        try {
            deleteLoggedItem(id);
        } catch (error) {
            console.error(error);
            // Optionally show an error toast to the user
        }
    };

    if (!intake) {
        return (
            <div>
                <h2 className="text-xl font-bold text-brand-offwhite mb-3">{t('todaysIntake')}</h2>
                <div className="bg-brand-olive p-4 rounded-md shadow-lg shadow-black/20 h-48 animate-pulse"></div>
            </div>
        );
    }

    const { loggedItems, totals } = intake;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-brand-offwhite">{t('todaysIntake')}</h2>
                {loggedItems.length > 0 && (
                     <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm font-semibold text-brand-yellow hover:underline"
                    >
                        {isExpanded ? t('hideItems') : t('viewItems')}
                    </button>
                )}
            </div>
            <div className="bg-brand-olive p-4 rounded-md shadow-lg shadow-black/20 space-y-4">
                <div className="space-y-3">
                    <NutrientProgress label={t('carbs')} value={totals.carbohydrates} goal={DAILY_GOALS.carbohydrates} Icon={CubeIcon} color="teal" />
                    <NutrientProgress label={t('protein')} value={totals.protein} goal={DAILY_GOALS.protein} Icon={SteakIcon} color="blue" />
                    <NutrientProgress label={t('fats')} value={totals.fats} goal={DAILY_GOALS.fats} Icon={DropletIcon} color="yellow" />
                    <NutrientProgress label={t('calories')} value={totals.calories} goal={DAILY_GOALS.calories} Icon={FireIcon} color="orange" />
                </div>
                
                {isExpanded && loggedItems.length > 0 && (
                    <div className="pt-3 border-t border-white/10 animate-fadeInUp">
                        <h3 className="font-semibold text-brand-beige mb-2">{t('loggedItems')}</h3>
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 -mr-2">
                            {loggedItems.map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm p-2 bg-brand-dark/50 rounded-lg group">
                                    <span className="text-brand-offwhite truncate pr-2">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-brand-beige/80 shrink-0">{Math.round(item.calories)} kcal</span>
                                        <button 
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-beige/60 hover:text-red-500"
                                            aria-label={`Delete ${item.name}`}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {loggedItems.length === 0 && (
                    <div className="text-center py-6 border-t border-white/10">
                        <p className="text-brand-beige font-semibold">{t('noFoodLogged')}</p>
                        <p className="text-sm text-brand-beige/80">{t('noFoodLoggedDescription')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyIntakeTracker;