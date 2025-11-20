import React, { useState, useEffect } from 'react';
import { ActiveView, GlucoseLog, WeightLog } from '../types';
import GlucoseCard from './GlucoseCard';
import PredictiveCard from './PredictiveCard';
import WalkCounter from './WalkCounter';
import WeightCard from './WeightCard';
import DailyIntakeTracker from './DailyIntakeTracker';
import { CameraIcon, PlusIcon, WeightScaleIcon, Cog6ToothIcon, XMarkIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import LogGlucoseModal from './LogGlucoseModal';
import LogWeightModal from './LogWeightModal';
import SettingsModal from './SettingsModal';
import { getGlucoseLogs, addGlucoseLog, getWeightLogs, addWeightLog } from '../services/logService';

interface DashboardProps {
  onQuickAction: (view: ActiveView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onQuickAction }) => {
  const { language, setLanguage, t } = useLocalization();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [latestGlucose, setLatestGlucose] = useState<GlucoseLog | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);


  useEffect(() => {
    const glucoseLogs = getGlucoseLogs();
    if (glucoseLogs.length > 0) {
      setLatestGlucose(glucoseLogs[0]);
    }
    const weightLogs = getWeightLogs();
    if (weightLogs.length > 0) {
      setLatestWeight(weightLogs[0]);
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning! ☀️');
    } else if (hour < 18) {
      setGreeting('Good afternoon! 👋');
    } else {
      setGreeting('Good evening! 🌙');
    }
  }, []);

  const handleSaveGlucose = (value: number) => {
    const newLog = addGlucoseLog(value);
    setLatestGlucose(newLog);
    setIsLogModalOpen(false);
  };

  const handleSaveWeight = (value: number, unit: 'kg' | 'lbs') => {
    const newLog = addWeightLog(value, unit);
    setLatestWeight(newLog);
    setIsWeightModalOpen(false);
  };

  const toggleLanguage = () => {
    const languages = ['en', 'es', 'ar'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex] as 'en' | 'es' | 'ar');
  };

  const fabActions = [
    { label: t('scanMeal'), Icon: CameraIcon, action: () => onQuickAction(ActiveView.MealScanner) },
    { label: t('logWeight'), Icon: WeightScaleIcon, action: () => setIsWeightModalOpen(true) },
    { label: t('logGlucose'), Icon: PlusIcon, action: () => setIsLogModalOpen(true) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-offwhite">{greeting}</h1>
          <p className="text-brand-beige opacity-80 text-md sm:text-lg">{t('summaryToday')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="font-semibold text-sm w-10 h-10 flex items-center justify-center rounded-full bg-brand-olive hover:bg-opacity-80 text-brand-beige transition-colors shadow-sm"
          >
            {language.toUpperCase()}
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-olive hover:bg-opacity-80 text-brand-beige transition-colors shadow-sm"
            aria-label={t('settings')}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {latestGlucose ? (
          <GlucoseCard
            glucose={latestGlucose.value}
            status={latestGlucose.status}
            timestamp={latestGlucose.timestamp}
          />
        ) : (
          <div className="bg-brand-olive p-4 rounded-3xl shadow-lg shadow-black/20 flex flex-col justify-center items-center text-center h-full">
            <p className="text-brand-beige opacity-80">{t('logYourFirstGlucose')}</p>
          </div>
        )}
        {latestWeight ? (
          <WeightCard
            weight={latestWeight.value}
            unit={latestWeight.unit}
            timestamp={latestWeight.timestamp}
          />
        ) : (
            <div className="bg-brand-olive p-4 rounded-3xl shadow-lg shadow-black/20 flex flex-col justify-center items-center text-center h-full">
            <p className="text-brand-beige opacity-80">{t('logYourWeight')}</p>
          </div>
        )}
      </div>
      <PredictiveCard />
      <WalkCounter />
      <DailyIntakeTracker />

      {/* FAB Backdrop */}
      {isFabOpen && (
        <div
          onClick={() => setIsFabOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 animate-fadeInUp"
          style={{ animationDuration: '0.3s' }}
        />
      )}

      {/* FAB Menu */}
      <div className="fixed bottom-28 right-6 rtl:right-auto rtl:left-6 z-40 flex flex-col items-end">
        <div
          className={`flex flex-col items-end gap-4 mb-4 transition-all duration-300 ease-in-out ${
            isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {fabActions.map(({ label, Icon, action }) => (
            <div key={label} className="flex items-center gap-3 rtl:flex-row-reverse">
              <span className="bg-brand-olive text-sm font-semibold text-brand-beige py-1.5 px-3 rounded-full shadow-md">{label}</span>
              <button
                onClick={() => { action(); setIsFabOpen(false); }}
                aria-label={label}
                className="w-14 h-14 bg-brand-olive text-brand-yellow rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                <Icon className="w-7 h-7" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-16 h-16 bg-brand-yellow text-brand-dark rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:bg-brand-yellow/90 active:scale-95"
          aria-haspopup="true"
          aria-expanded={isFabOpen}
          aria-label={t('quickActions')}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <PlusIcon
              className={`absolute transition-all duration-300 ease-in-out ${
              isFabOpen ? 'transform rotate-45 opacity-0' : 'transform rotate-0 opacity-100'
              }`}
            />
            <XMarkIcon
              className={`absolute transition-all duration-300 ease-in-out ${
              isFabOpen ? 'transform rotate-0 opacity-100' : 'transform -rotate-45 opacity-0'
              }`}
            />
          </div>
        </button>
      </div>

      {isLogModalOpen && <LogGlucoseModal onClose={() => setIsLogModalOpen(false)} onSave={handleSaveGlucose} />}
      {isWeightModalOpen && <LogWeightModal onClose={() => setIsWeightModalOpen(false)} onSave={handleSaveWeight} />}
      {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
    </div>
  );
};

export default Dashboard;