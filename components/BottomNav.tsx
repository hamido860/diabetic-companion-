import React from 'react';
import { ActiveView } from '../types';
import { HomeIcon, DocumentChartBarIcon, SparklesIcon, BookOpenIcon, LightBulbIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { t } = useLocalization();

  const navItems = [
    { view: ActiveView.Dashboard, Icon: HomeIcon, label: t('home') },
    { view: ActiveView.Logs, Icon: DocumentChartBarIcon, label: t('logs') },
    { view: ActiveView.Recipes, Icon: BookOpenIcon, label: t('recipes') },
    { view: ActiveView.AiChat, Icon: SparklesIcon, label: t('aiChat') },
    { view: ActiveView.Learn, Icon: LightBulbIcon, label: t('learn') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 z-50 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.15)]">
      <div className="flex justify-around items-center h-24 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors w-16 ${
                  isActive 
                  ? 'text-teal-500 dark:text-teal-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.Icon className="w-7 h-7" />
              <span className={`text-xs transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;