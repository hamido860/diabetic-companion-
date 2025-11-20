import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useLocalization } from '../contexts/LocalizationContext';
import { GlucoseStatus } from '../types';
import { formatTimestamp } from '../utils';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from './icons/Icons';

interface GlucoseCardProps {
  glucose: number;
  status: GlucoseStatus;
  timestamp: string;
}

const GlucoseCard: React.FC<GlucoseCardProps> = ({ glucose, status, timestamp }) => {
  const { t } = useLocalization();

  const getStatusInfo = (status: GlucoseStatus, t: (key: any) => string) => {
    switch (status) {
      case GlucoseStatus.Low:
        return { text: t('low'), Icon: ArrowDownIcon, styles: { color: '#3498db' }, badgeStyles: { backgroundColor: 'rgba(52, 152, 219, 0.2)', color: '#3498db' } };
      case GlucoseStatus.Normal:
        return { text: t('normal'), Icon: MinusIcon, styles: { color: '#2ecc71' }, badgeStyles: { backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71' } };
      case GlucoseStatus.High:
        return { text: t('high'), Icon: ArrowUpIcon, styles: { color: '#e74c3c' }, badgeStyles: { backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c' } };
      default:
        return { text: t('normal'), Icon: MinusIcon, styles: { color: '#2ecc71' }, badgeStyles: { backgroundColor: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71' } };
    }
  };

  const statusInfo = getStatusInfo(status, t);

  return (
    <View style={styles.card}>
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>{t('glucose')}</Text>
          <View style={[styles.badge, statusInfo.badgeStyles]}>
            <statusInfo.Icon width={12} height={12} color={statusInfo.styles.color} />
            <Text style={[styles.badgeText, { color: statusInfo.styles.color }]}>{statusInfo.text}</Text>
          </View>
        </View>
        <Text style={[styles.glucoseValue, statusInfo.styles]}>{glucose}</Text>
        <Text style={styles.unit}>{t('mgdl')}</Text>
      </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [
              {
                data: [Math.max(0, glucose - 20), glucose, Math.max(0, glucose - 10), glucose + 5, glucose],
              },
            ],
          }}
          width={Dimensions.get('window').width - 80}
          height={80}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
          chartConfig={{
            backgroundColor: '#6B7A4A',
            backgroundGradientFrom: '#6B7A4A',
            backgroundGradientTo: '#6B7A4A',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(243, 243, 233, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
      <View>
        <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6B7A4A',
    padding: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: 'rgba(243, 243, 233, 0.8)',
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  glucoseValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 14,
    color: 'rgba(243, 243, 233, 0.8)',
  },
  chartContainer: {
    marginTop: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(243, 243, 233, 0.6)',
  },
});

export default GlucoseCard;
