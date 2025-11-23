import { useState, useEffect } from 'react';
import { CapacitorPedometer as Pedometer } from '@capgo/capacitor-pedometer';
import { Capacitor } from '@capacitor/core';
import { getTodaysSteps, addSteps } from '../services/logService';

export const useStepTracker = () => {
    const [steps, setSteps] = useState(0);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        setIsNative(Capacitor.isNativePlatform());

        const loadSteps = () => {
             setSteps(getTodaysSteps());
        };

        loadSteps();

        // If not native, we rely on manual updates which will trigger re-renders
        // via the component state, but let's listen for storage events just in case
        // (though storage events only work across tabs, not same tab)

        if (Capacitor.isNativePlatform()) {
             startTracking();
        }

        return () => {
             // Cleanup if needed
        };
    }, []);

    const startTracking = async () => {
        try {
            const perm = await Pedometer.checkPermissions();
            if (perm.activityRecognition !== 'granted') {
                await Pedometer.requestPermissions();
            }

            await Pedometer.startMeasurementUpdates();

            // Listen for updates
            Pedometer.addListener('step', (data) => {
                 // data.numberOfSteps is the total steps since reboot or start
                 setSteps(data.numberOfSteps || 0);
            });

        } catch (e) {
            console.error("Pedometer error:", e);
        }
    };

    const manualAddSteps = (count: number) => {
        const newTotal = addSteps(count);
        setSteps(newTotal);
    };

    return { steps, manualAddSteps, isNative };
};
