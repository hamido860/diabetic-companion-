import { LocalNotifications } from '@capacitor/local-notifications';

const GLUCOSE_REMINDER_ID = 1000;
const WALK_REMINDER_ID = 2000;

export const requestNotificationPermissions = async (): Promise<boolean> => {
    try {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    } catch (e) {
        console.error("Failed to request permissions:", e);
        return false;
    }
};

export const scheduleGlucoseReminder = async (minutes: number): Promise<void> => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            throw new Error("Notification permissions denied");
        }

        const scheduledTime = new Date(Date.now() + minutes * 60 * 1000);

        await LocalNotifications.schedule({
            notifications: [{
                title: "Glucose Check",
                body: "It's time to check your blood sugar levels.",
                id: GLUCOSE_REMINDER_ID + Math.floor(Math.random() * 100), // Unique ID for multiple one-off reminders
                schedule: { at: scheduledTime },
                sound: undefined, // default
                attachments: undefined,
                actionTypeId: "",
                extra: null
            }]
        });
    } catch (e) {
        console.error("Failed to schedule glucose reminder:", e);
        throw e;
    }
};

export const scheduleWalkReminder = async (hours: number, minutes: number): Promise<void> => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            throw new Error("Notification permissions denied");
        }

        // Cancel existing walk reminder if any
        await LocalNotifications.cancel({ notifications: [{ id: WALK_REMINDER_ID }] });

        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours);
        scheduledTime.setMinutes(minutes);
        scheduledTime.setSeconds(0);

        if (scheduledTime <= now) {
            // If time has passed today, schedule for tomorrow
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        await LocalNotifications.schedule({
            notifications: [{
                title: "Time for a Walk!",
                body: "Take a break and go for a walk to stay healthy.",
                id: WALK_REMINDER_ID,
                schedule: {
                    at: scheduledTime,
                    repeats: true,
                    every: 'day'
                },
            }]
        });
    } catch (e) {
        console.error("Failed to schedule walk reminder:", e);
        throw e;
    }
};

export const cancelWalkReminder = async (): Promise<void> => {
     try {
        await LocalNotifications.cancel({ notifications: [{ id: WALK_REMINDER_ID }] });
    } catch (e) {
        console.error("Failed to cancel walk reminder:", e);
        throw e;
    }
};
