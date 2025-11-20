import React, { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import MealScanner from './components/MealScanner';
import Recipes from './components/Recipes';
import Logs from './components/Logs';
import Learn from './components/Learn';
import NutritionInfo from './components/NutritionInfo';
import { ActiveView } from './types';
import { initializeGlucoseLogs, initializeWeightLogs } from './services/logService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Dashboard);

  useEffect(() => {
    initializeGlucoseLogs();
    initializeWeightLogs();
  }, []);

  const renderActiveView = useCallback(() => {
    switch (activeView) {
      case ActiveView.Dashboard:
        return <Dashboard onQuickAction={setActiveView} />;
      case ActiveView.MealScanner:
        return <MealScanner />;
      case ActiveView.Recipes:
        return <Recipes />;
      case ActiveView.Logs:
        return <Logs />;
      case ActiveView.Learn:
        return <Learn />;
      case ActiveView.Nutrition:
        return <NutritionInfo />;
      default:
        return <Dashboard onQuickAction={setActiveView} />;
    }
  }, [activeView]);

  return (
    <div className="bg-brand-dark text-brand-beige min-h-screen flex flex-col">
      <main className="flex-grow p-4 sm:p-6 pb-28">
        <div key={activeView} className="animate-fadeInUp">
          {renderActiveView()}
        </div>
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;