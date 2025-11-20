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
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-olive z-50 rounded-t-[28px] shadow-[0_-5px_25px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-24 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors w-16 ${
                  isActive
                  ? 'text-brand-yellow'
                  : 'text-brand-beige/60 hover:text-brand-yellow'
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