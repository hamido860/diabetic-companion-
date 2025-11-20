import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.nav}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <TouchableOpacity
              key={item.view}
              onPress={() => setActiveView(item.view)}
              style={styles.navItem}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <item.Icon width={28} height={28} color={isActive ? '#FFD700' : '#F3F3E9'} />
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6B7A4A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 96,
    maxWidth: 512,
    marginHorizontal: 'auto',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    color: 'rgba(243, 243, 233, 0.6)',
    marginTop: 4,
  },
  activeNavLabel: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default BottomNav;
