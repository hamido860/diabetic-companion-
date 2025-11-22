import React from 'react';
import { ActiveView } from '../types';
import { HomeIcon, ClipboardDocumentListIcon, BookOpenIcon, AcademicCapIcon, MagnifyingGlassIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const { t } = useLocalization();

  const navItems = [
    { view: ActiveView.Dashboard, Icon: HomeIcon, label: t('home') },
    { view: ActiveView.Logs, Icon: ClipboardDocumentListIcon, label: t('logs') },
    { view: ActiveView.Nutrition, Icon: MagnifyingGlassIcon, label: t('nutrition') },
    { view: ActiveView.Recipes, Icon: BookOpenIcon, label: t('recipes') },
    { view: ActiveView.Learn, Icon: AcademicCapIcon, label: t('learn') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-brand-surface/95 backdrop-blur-md z-50 rounded-t-[28px] shadow-[0_-5px_30px_rgba(0,0,0,0.3)] border-t border-white/5">
      <div className="flex justify-around items-center h-24 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`relative flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 w-16 group ${
                  isActive 
                  ? 'text-brand-primary'
                  : 'text-brand-text-muted hover:text-brand-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute -top-3 w-8 h-1 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(247,178,44,0.5)] animate-scaleIn" />
              )}
              <item.Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? '-translate-y-1' : 'group-hover:-translate-y-1'}`} />
              <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-70'}`}>
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