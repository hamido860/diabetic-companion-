import { useState, useEffect, useCallback } from 'react';

interface PedometerHook {
  isSupported: boolean;
  isActive: boolean;
  permissionGranted: boolean;
  steps: number;
  start: () => void;
  stop: () => void;
  requestPermission: () => Promise<void>;
  resetSessionSteps: () => void;
}

export const usePedometer = (): PedometerHook => {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [steps, setSteps] = useState(0);

  // Peak detection variables
  const [lastMagnitude, setLastMagnitude] = useState(0);
  const [isAboveThreshold, setIsAboveThreshold] = useState(false);

  const THRESHOLD = 10.5; // Slightly above 9.8m/s^2 (gravity)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Simple step detection: crossing threshold
    // Real pedometers are much more complex (filtering, windows, etc.),
    // but this suffices for a "Device movement" demo.
    if (magnitude > THRESHOLD && !isAboveThreshold) {
        // Rising edge
        setIsAboveThreshold(true);
    } else if (magnitude < THRESHOLD && isAboveThreshold) {
        // Falling edge - STEP!
        setSteps(prev => prev + 1);
        setIsAboveThreshold(false);
    }

    setLastMagnitude(magnitude);
  }, [isAboveThreshold]);

  const start = useCallback(() => {
    if (!isSupported) return;
    if (!permissionGranted && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        // On iOS, we need to request permission first, usually triggered by a user action.
        // So start() should be called from a button click.
        console.warn("Permission needed before starting. Call requestPermission() first.");
        return;
    }

    window.addEventListener('devicemotion', handleMotion);
    setIsActive(true);
  }, [isSupported, permissionGranted, handleMotion]);

  const stop = useCallback(() => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsActive(false);
  }, [handleMotion]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          console.warn("Permission denied");
          setPermissionGranted(false);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Non-iOS devices typically don't need explicit permission for basic sensor access in secure contexts
      setPermissionGranted(true);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  return {
    isSupported,
    isActive,
    permissionGranted,
    steps,
    start,
    stop,
    requestPermission,
    resetSessionSteps: () => setSteps(0)
  };
};
