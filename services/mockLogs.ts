import { GlucoseLog, GlucoseStatus, WeightLog } from '../types';

function getRandomStatus(value: number): GlucoseStatus {
  if (value < 70) return 'Low';
  if (value >= 70 && value <= 125) return 'Normal';
  if (value > 125 && value <= 180) return 'Slightly High';
  return 'High';
}

function generateMockLogs(): GlucoseLog[] {
  const logs: GlucoseLog[] = [];
  const now = new Date();

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - i * 6 * 60 * 60 * 1000); // 6 hours apart
    const value = Math.floor(Math.random() * (220 - 60 + 1)) + 60; // Random value between 60 and 220
    const status = getRandomStatus(value);
    
    logs.push({
      id: `log-${i}`,
      value,
      timestamp: timestamp.toISOString(),
      status,
    });
  }

  return logs;
}

export const mockGlucoseLogs: GlucoseLog[] = generateMockLogs();

function generateMockWeightLogs(): WeightLog[] {
  const logs: WeightLog[] = [];
  const now = new Date();
  let currentWeight = 85; // Starting weight in kg

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000); // 1 week apart
    const value = parseFloat((currentWeight - Math.random() * 0.5).toFixed(1)); // small decrease
    currentWeight = value;

    logs.push({
      id: `weight-${i}`,
      value,
      unit: 'kg',
      timestamp: timestamp.toISOString(),
    });
  }

  return logs;
}

export const mockWeightLogs: WeightLog[] = generateMockWeightLogs();