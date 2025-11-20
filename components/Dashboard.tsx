import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ActiveView, GlucoseLog, WeightLog } from '../types';
import GlucoseCard from './GlucoseCard';
import WeightCard from './WeightCard';
import { CameraIcon, PlusIcon, WeightScaleIcon, Cog6ToothIcon, XMarkIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { getGlucoseLogs, addGlucoseLog, getWeightLogs, addWeightLog } from '../services/logService';
// Modals will be implemented later
// import LogGlucoseModal from './LogGlucoseModal';
// import LogWeightModal from './LogWeightModal';
// import SettingsModal from './SettingsModal';

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
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.summary}>{t('summaryToday')}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.languageButton} onPress={toggleLanguage}>
              <Text style={styles.languageButtonText}>{language.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setIsSettingsModalOpen(true)}>
              <Cog6ToothIcon width={20} height={20} color="#F3F3E9" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardGrid}>
          {latestGlucose ? (
            <GlucoseCard
              glucose={latestGlucose.value}
              status={latestGlucose.status}
              timestamp={latestGlucose.timestamp}
            />
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>{t('logYourFirstGlucose')}</Text>
            </View>
          )}
          {latestWeight ? (
            <WeightCard
              weight={latestWeight.value}
              unit={latestWeight.unit}
              timestamp={latestWeight.timestamp}
            />
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>{t('logYourWeight')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isFabOpen && (
        <TouchableOpacity
          style={styles.fabBackdrop}
          onPress={() => setIsFabOpen(false)}
        />
      )}

      <View style={styles.fabContainer}>
        {isFabOpen && (
          <View style={styles.fabMenu}>
            {fabActions.map(({ label, Icon, action }) => (
              <View key={label} style={styles.fabAction}>
                <Text style={styles.fabLabel}>{label}</Text>
                <TouchableOpacity
                  onPress={() => { action(); setIsFabOpen(false); }}
                  style={styles.fabButton}
                >
                  <Icon width={28} height={28} color="#FFD700" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => setIsFabOpen(!isFabOpen)}
          style={styles.fab}
        >
          {isFabOpen ? <XMarkIcon width={32} height={32} color="#1E2A2D" /> : <PlusIcon width={32} height={32} color="#1E2A2D" />}
        </TouchableOpacity>
      </View>

      {/* Modals will be implemented here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F3F3E9',
  },
  summary: {
    color: '#F3F3E9',
    opacity: 0.8,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  languageButtonText: {
    color: '#F3F3E9',
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B7A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardGrid: {
    padding: 20,
    gap: 20,
  },
  placeholderCard: {
    backgroundColor: '#6B7A4A',
    padding: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  placeholderText: {
    color: 'rgba(243, 243, 233, 0.8)',
  },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 30,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    zIndex: 40,
    alignItems: 'flex-end',
  },
  fabMenu: {
    marginBottom: 16,
    gap: 16,
  },
  fabAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabLabel: {
    backgroundColor: '#6B7A4A',
    color: '#F3F3E9',
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B7A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;
