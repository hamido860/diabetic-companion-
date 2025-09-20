import { GlucoseLog, GlucoseStatus, LoggedItem, WeightLog } from '../types';
import { mockGlucoseLogs, mockWeightLogs } from './mockLogs';

const GLUCOSE_LOGS_STORAGE_KEY = 'glucoseLogs';
const MEAL_LOGS_STORAGE_KEY = 'mealLogs';
const WEIGHT_LOGS_STORAGE_KEY = 'weightLogs';
const DAILY_STEPS_STORAGE_KEY = 'dailySteps';

function getStatusForValue(value: number): GlucoseStatus {
  if (value < 70) return 'Low';
  if (value > 180) return 'High';
  if (value > 125) return 'Slightly High';
  return 'Normal';
}

// Function to initialize logs if they don't exist
export const initializeGlucoseLogs = (): void => {
    try {
        const logsRaw = localStorage.getItem(GLUCOSE_LOGS_STORAGE_KEY);
        if (!logsRaw) {
            const sortedLogs = mockGlucoseLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            localStorage.setItem(GLUCOSE_LOGS_STORAGE_KEY, JSON.stringify(sortedLogs));
        }
    } catch (e) {
        console.error("Failed to initialize glucose logs:", e);
    }
};


export const getGlucoseLogs = (): GlucoseLog[] => {
    try {
        const logsRaw = localStorage.getItem(GLUCOSE_LOGS_STORAGE_KEY);
        return logsRaw ? JSON.parse(logsRaw) : [];
    } catch (e) {
        console.error("Failed to read glucose logs:", e);
        return [];
    }
};

export const addGlucoseLog = (value: number): GlucoseLog => {
    const logs = getGlucoseLogs();
    const newLog: GlucoseLog = {
        id: Date.now().toString(),
        value,
        timestamp: new Date().toISOString(),
        status: getStatusForValue(value),
    };

    const updatedLogs = [newLog, ...logs];
    
    try {
        localStorage.setItem(GLUCOSE_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
        console.error("Failed to save glucose log:", e);
        throw new Error("Could not save glucose log.");
    }
    return newLog;
};

export const deleteGlucoseLog = (id: string): void => {
    try {
        const logs = getGlucoseLogs();
        const updatedLogs = logs.filter(log => log.id !== id);
        localStorage.setItem(GLUCOSE_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
        console.error("Failed to delete glucose log:", e);
        throw new Error("Could not delete glucose log.");
    }
};

export const initializeWeightLogs = (): void => {
    try {
        const logsRaw = localStorage.getItem(WEIGHT_LOGS_STORAGE_KEY);
        if (!logsRaw) {
            const sortedLogs = mockWeightLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            localStorage.setItem(WEIGHT_LOGS_STORAGE_KEY, JSON.stringify(sortedLogs));
        }
    } catch (e) {
        console.error("Failed to initialize weight logs:", e);
    }
};

export const getWeightLogs = (): WeightLog[] => {
    try {
        const logsRaw = localStorage.getItem(WEIGHT_LOGS_STORAGE_KEY);
        return logsRaw ? JSON.parse(logsRaw) : [];
    } catch (e) {
        console.error("Failed to read weight logs:", e);
        return [];
    }
};

export const addWeightLog = (value: number, unit: 'kg' | 'lbs'): WeightLog => {
    const logs = getWeightLogs();
    const newLog: WeightLog = {
        id: Date.now().toString(),
        value,
        unit,
        timestamp: new Date().toISOString(),
    };
    const updatedLogs = [newLog, ...logs];
    try {
        localStorage.setItem(WEIGHT_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
        console.error("Failed to save weight log:", e);
        throw new Error("Could not save weight log.");
    }
    return newLog;
};

export const deleteWeightLog = (id: string): void => {
    try {
        const logs = getWeightLogs();
        const updatedLogs = logs.filter(log => log.id !== id);
        localStorage.setItem(WEIGHT_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
        console.error("Failed to delete weight log:", e);
        throw new Error("Could not delete weight log.");
    }
};

export const addLoggedItem = (item: Omit<LoggedItem, 'id' | 'loggedAt'>): void => {
    try {
        const mealLogsRaw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY);
        const existingLogs: LoggedItem[] = mealLogsRaw ? JSON.parse(mealLogsRaw) : [];

        const newLog: LoggedItem = {
            ...item,
            id: Date.now().toString(),
            loggedAt: new Date().toISOString(),
        };

        const updatedLogs = [newLog, ...existingLogs];
        localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
        window.dispatchEvent(new Event('storageUpdated'));
    } catch (e) {
        console.error("Failed to save logged item:", e);
        throw new Error("Could not save logged item.");
    }
};

export const deleteLoggedItem = (id: string): void => {
    try {
        const mealLogsRaw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY);
        if (!mealLogsRaw) return;

        const allItems: LoggedItem[] = JSON.parse(mealLogsRaw);
        const updatedItems = allItems.filter(item => item.id !== id);

        localStorage.setItem(MEAL_LOGS_STORAGE_KEY, JSON.stringify(updatedItems));
        window.dispatchEvent(new Event('storageUpdated'));
    } catch (e) {
        console.error("Failed to delete logged item:", e);
        throw new Error("Could not delete logged item.");
    }
};


export const getTodaysIntake = (): { loggedItems: LoggedItem[], totals: Omit<LoggedItem, 'id' | 'name' | 'loggedAt' | 'confidence'> } => {
    try {
        const mealLogsRaw = localStorage.getItem(MEAL_LOGS_STORAGE_KEY);
        if (!mealLogsRaw) {
            return { loggedItems: [], totals: { carbohydrates: 0, protein: 0, fats: 0, calories: 0 } };
        }
        
        const allItems: LoggedItem[] = JSON.parse(mealLogsRaw);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const loggedItems = allItems
            .filter(item => {
                if (!item.loggedAt) return false;
                const itemDate = new Date(item.loggedAt);
                return itemDate >= today;
            })
            .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

        const totals = loggedItems.reduce((acc, item) => {
            acc.carbohydrates += item.carbohydrates || 0;
            acc.protein += item.protein || 0;
            acc.fats += item.fats || 0;
            acc.calories += item.calories || 0;
            return acc;
        }, { carbohydrates: 0, protein: 0, fats: 0, calories: 0 });

        return { loggedItems, totals };
    } catch (e) {
        console.error("Failed to read today's intake:", e);
        return { loggedItems: [], totals: { carbohydrates: 0, protein: 0, fats: 0, calories: 0 } };
    }
};

export const getTodaysSteps = (): number => {
    try {
        const stepsRaw = localStorage.getItem(DAILY_STEPS_STORAGE_KEY);
        if (!stepsRaw) return 0;
        
        const { date, steps } = JSON.parse(stepsRaw);
        const today = new Date().toISOString().split('T')[0];
        
        if (date === today) {
            return steps;
        } else {
            // It's a new day, reset steps
            localStorage.removeItem(DAILY_STEPS_STORAGE_KEY);
            return 0;
        }
    } catch (e) {
        console.error("Failed to read today's steps:", e);
        return 0;
    }
};

export const addSteps = (stepsToAdd: number): number => {
    const currentSteps = getTodaysSteps();
    const newTotal = currentSteps + stepsToAdd;
    const today = new Date().toISOString().split('T')[0];

    try {
        localStorage.setItem(DAILY_STEPS_STORAGE_KEY, JSON.stringify({ date: today, steps: newTotal }));
    } catch (e) {
        console.error("Failed to save steps:", e);
        throw new Error("Could not save steps.");
    }
    return newTotal;
};

export const resetAllLogs = (): void => {
    try {
        localStorage.removeItem(GLUCOSE_LOGS_STORAGE_KEY);
        localStorage.removeItem(WEIGHT_LOGS_STORAGE_KEY);
        localStorage.removeItem(MEAL_LOGS_STORAGE_KEY);
        localStorage.removeItem(DAILY_STEPS_STORAGE_KEY);
    } catch (e) {
        console.error("Failed to reset logs:", e);
        throw new Error("Could not reset app data.");
    }
};