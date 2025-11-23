import { GlucoseLog, GlucoseStatus, WeightLog } from '../types';

const generateMockData = (): { glucoseLogs: GlucoseLog[], weightLogs: WeightLog[] } => {
    const glucoseLogs: GlucoseLog[] = [];
    const weightLogs: WeightLog[] = [];
    const now = new Date();
    
    // Generate data for the last 90 days
    for (let i = 0; i < 90; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // 2-4 readings per day
        const readingsCount = Math.floor(Math.random() * 3) + 2;

        for (let j = 0; j < readingsCount; j++) {
            // Random time between 8am and 10pm
            date.setHours(8 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));

            // Random glucose value with some trends
            // Base value oscillates slightly over the month
            const baseValue = 110 + Math.sin(i / 10) * 10;
            const randomVariation = Math.floor(Math.random() * 60) - 20; // -20 to +40
            const value = Math.floor(baseValue + randomVariation);

            let status: GlucoseStatus = 'Normal';
            if (value < 70) status = 'Low';
            else if (value > 180) status = 'High';
            else if (value > 125) status = 'Slightly High';

            glucoseLogs.push({
                id: `g-${date.getTime()}-${j}`,
                value,
                timestamp: date.toISOString(),
                status
            });
        }

        // Weight logs: 1 every few days
        if (i % 5 === 0) {
            const weightDate = new Date(now);
            weightDate.setDate(weightDate.getDate() - i);
            weightDate.setHours(8, 0);

             // Start at 80kg and lose/gain slowly
             const weightValue = 80 - (i * 0.05) + (Math.random() * 0.5);

             weightLogs.push({
                 id: `w-${weightDate.getTime()}`,
                 value: parseFloat(weightValue.toFixed(1)),
                 unit: 'kg',
                 timestamp: weightDate.toISOString()
             });
        }
    }

    return { glucoseLogs, weightLogs };
};

const { glucoseLogs, weightLogs } = generateMockData();

export const mockGlucoseLogs = glucoseLogs;
export const mockWeightLogs = weightLogs;
