import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';
import Logs from './components/Logs';
import { ActiveView } from './types';
// Import other components once they are migrated
// import MealScanner from './components/MealScanner';
// import Recipes from './components/Recipes';
// import Learn from './components/Learn';
// import NutritionInfo from './components/NutritionInfo';
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
      case ActiveView.Logs:
        return <Logs />;
      // Other cases will be added as components are migrated
      // case ActiveView.MealScanner:
      //   return <MealScanner />;
      // case ActiveView.Recipes:
      //   return <Recipes />;
      // case ActiveView.Learn:
      //   return <Learn />;
      // case ActiveView.Nutrition:
      //   return <NutritionInfo />;
      default:
        return <Dashboard onQuickAction={setActiveView} />;
    }
  }, [activeView]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          {renderActiveView()}
        </View>
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E2A2D', // brand-dark
  },
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 96, // To avoid overlap with BottomNav
  },
});

export default App;
