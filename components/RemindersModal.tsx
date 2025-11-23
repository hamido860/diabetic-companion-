import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { XMarkIcon, ClockIcon, WalkingIcon } from './icons/Icons';
import { scheduleGlucoseReminder, scheduleWalkReminder, cancelWalkReminder } from '../services/reminderService';

interface RemindersModalProps {
    onClose: () => void;
}

const RemindersModal: React.FC<RemindersModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const [glucoseMessage, setGlucoseMessage] = useState<string | null>(null);
    const [walkMessage, setWalkMessage] = useState<string | null>(null);
    const [walkTime, setWalkTime] = useState("18:00");
    const [isWalkReminderActive, setIsWalkReminderActive] = useState(false);

    const handleGlucoseReminder = async (minutes: number) => {
        try {
            await scheduleGlucoseReminder(minutes);
            setGlucoseMessage(`Reminder set for ${minutes / 60} hour(s)`);
            setTimeout(() => setGlucoseMessage(null), 3000);
        } catch (e) {
            setGlucoseMessage("Failed to set reminder. Check permissions.");
        }
    };

    const handleSetWalkReminder = async () => {
        try {
            const [hours, minutes] = walkTime.split(':').map(Number);
            await scheduleWalkReminder(hours, minutes);
            setIsWalkReminderActive(true);
            setWalkMessage(`Daily walk reminder set for ${walkTime}`);
            setTimeout(() => setWalkMessage(null), 3000);
        } catch (e) {
            setWalkMessage("Failed to set reminder.");
        }
    };

    const handleCancelWalkReminder = async () => {
        try {
            await cancelWalkReminder();
            setIsWalkReminderActive(false);
            setWalkMessage("Daily walk reminder cancelled");
            setTimeout(() => setWalkMessage(null), 3000);
        } catch (e) {
            setWalkMessage("Failed to cancel reminder.");
        }
    };

    return (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
            <div
                className="bg-brand-olive rounded-md shadow-xl w-full max-w-sm p-6 space-y-6 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-brand-beige/10 pb-4">
                    <h2 className="text-2xl font-bold text-brand-offwhite">Reminders</h2>
                    <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige" aria-label="Close">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Glucose Reminder Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-brand-offwhite font-semibold">
                         <ClockIcon className="w-5 h-5 text-brand-yellow" />
                         <h3>Glucose Check</h3>
                    </div>
                    <p className="text-sm text-brand-beige/60">Set a one-time reminder to check your blood sugar.</p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleGlucoseReminder(60)}
                            className="bg-brand-dark hover:bg-brand-dark/80 text-brand-beige py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            In 1 Hour
                        </button>
                        <button
                             onClick={() => handleGlucoseReminder(120)}
                            className="bg-brand-dark hover:bg-brand-dark/80 text-brand-beige py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            In 2 Hours
                        </button>
                    </div>
                    {glucoseMessage && <p className="text-xs text-brand-yellow">{glucoseMessage}</p>}
                </div>

                {/* Walk Reminder Section */}
                <div className="space-y-3 pt-4 border-t border-brand-beige/10">
                     <div className="flex items-center gap-2 text-brand-offwhite font-semibold">
                         <WalkingIcon className="w-5 h-5 text-brand-yellow" />
                         <h3>Daily Walk</h3>
                    </div>
                     <p className="text-sm text-brand-beige/60">Schedule a daily reminder to take a walk.</p>

                     <div className="flex items-center gap-3">
                         <input
                            type="time"
                            value={walkTime}
                            onChange={(e) => setWalkTime(e.target.value)}
                            className="bg-brand-dark text-brand-offwhite p-2 rounded-lg border border-brand-beige/20 focus:outline-none focus:border-brand-yellow"
                         />
                         <button
                            onClick={handleSetWalkReminder}
                            className="flex-grow bg-brand-yellow text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                         >
                             Set
                         </button>
                     </div>
                      {isWalkReminderActive && (
                        <button
                            onClick={handleCancelWalkReminder}
                            className="text-xs text-red-400 underline mt-1"
                        >
                            Cancel recurring reminder
                        </button>
                     )}
                     {walkMessage && <p className="text-xs text-brand-yellow">{walkMessage}</p>}
                </div>

            </div>
        </div>
    );
};

export default RemindersModal;
