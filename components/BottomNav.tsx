import React from 'react';
import { ActiveView } from '../types';
import { HomeIcon, DocumentChartBarIcon, BookOpenIcon, LightBulbIcon, MagnifyingGlassIcon } from './icons/Icons';
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
    { view: ActiveView.Nutrition, Icon: MagnifyingGlassIcon, label: t('nutrition') },
    { view: ActiveView.Recipes, Icon: BookOpenIcon, label: t('recipes') },
    { view: ActiveView.Learn, Icon: LightBulbIcon, label: t('learn') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E]/90 backdrop-blur-md border-t border-white/5 z-50 rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 w-16 ${
                  isActive 
                  ? 'text-brand-yellow -translate-y-2'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.Icon className={`w-7 h-7 ${isActive ? 'drop-shadow-glow' : ''}`} />
              <span className={`text-[10px] uppercase tracking-wider transition-all ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-0'}`}>
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