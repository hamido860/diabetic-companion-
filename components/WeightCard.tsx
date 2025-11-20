import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useLocalization } from '../contexts/LocalizationContext';
import { WeightScaleIcon } from './icons/Icons';
import { formatTimestamp } from '../utils';

interface WeightCardProps {
  weight: number;
  unit: 'kg' | 'lbs';
  timestamp: string;
}

const WeightCard: React.FC<WeightCardProps> = ({ weight, unit, timestamp }) => {
  const { t } = useLocalization();

  return (
    <View style={styles.card}>
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>{t('currentWeight')}</Text>
          <WeightScaleIcon width={20} height={20} color="rgba(243, 243, 233, 0.8)" />
        </View>
        <Text style={styles.weightValue}>{weight}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [
              {
                data: [weight - 2, weight, weight - 1, weight + 1, weight],
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
  weightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F3F3E9',
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

export default WeightCard;
