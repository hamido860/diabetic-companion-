import React, { useState, useRef, useEffect } from 'react';
import { analyzeMealImage } from '../services/geminiService';
import { NutritionInfo } from '../types';
import { ArrowUpOnSquareIcon, CameraIcon, CheckIcon, ShutterIcon, ArrowPathIcon, XMarkIcon, CubeIcon, SteakIcon, DropletIcon, FireIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { addLoggedItem } from '../services/logService';


const MealScanner: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { t } = useLocalization();

  useEffect(() => {
    // Check for multiple cameras on mount
    const checkCameras = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setHasMultipleCameras(videoDevices.length > 1);
            } catch (err) {
                console.error("Error enumerating devices:", err);
            }
        }
    };
    checkCameras();

    // Cleanup stream on component unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const startStream = async () => {
        if (isCameraOpen) {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                let stream;
                try {
                    const constraints = { video: { facingMode } };
                    stream = await navigator.mediaDevices.getUserMedia(constraints);
                } catch (err: any) {
                    console.warn(`Could not get camera with facingMode: ${facingMode}. Error: ${err.name}. Trying fallback.`);
                    // If the specific camera is not available (NotFoundError) or constraints can't be met (OverconstrainedError),
                    // try again with simpler constraints. This often happens on laptops that don't have a 'environment' camera.
                    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    } else {
                        // For other errors (like NotAllowedError for permissions), we don't want to retry. Just re-throw.
                        throw err;
                    }
                }
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                streamRef.current = stream;
            } catch (err: any) {
                console.error("Error accessing camera:", err);
                let errorMessage = t('cameraError');
                if (err.name === 'NotAllowedError') {
                    errorMessage = t('cameraPermissionDeniedError');
                } else if (err.name === 'NotFoundError') {
                    errorMessage = t('cameraNotFoundError');
                }
                setError(errorMessage);
                setIsCameraOpen(false);
            }
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    };
    startStream();
  }, [isCameraOpen, facingMode, t]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setNutritionInfo(null);
      setError(null);
      setIsLogged(false);
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setNutritionInfo(null);
    setIsLogged(false);
    try {
      const result = await analyzeMealImage(image);
      setNutritionInfo(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setNutritionInfo(null);
    setError(null);
    setIsLoading(false);
    setIsLogged(false);
    setCapturedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleTakePhotoClick = () => {
    handleReset();
    setIsCameraOpen(true);
  }

  const handleUploadClick = () => {
      handleReset();
      fileInputRef.current?.click();
  }
  
  const handleCapture = () => {
    const video = videoRef.current;
    if (video && video.readyState >= video.HAVE_METADATA) {
        const canvas = document.createElement('canvas');

        const isLandscape = window.innerWidth >= 640; // sm breakpoint in Tailwind
        const targetAspectRatio = isLandscape ? 4 / 3 : 3 / 4;
        const videoAspectRatio = video.videoWidth / video.videoHeight;

        let sWidth = video.videoWidth;
        let sHeight = video.videoHeight;
        let sx = 0;
        let sy = 0;

        if (videoAspectRatio > targetAspectRatio) {
            sWidth = video.videoHeight * targetAspectRatio;
            sx = (video.videoWidth - sWidth) / 2;
        } else {
            sHeight = video.videoWidth / targetAspectRatio;
            sy = (video.videoHeight - sHeight) / 2;
        }

        if (isLandscape) {
            canvas.width = 1024;
            canvas.height = canvas.width / targetAspectRatio;
        } else {
            canvas.height = 1024;
            canvas.width = canvas.height * targetAspectRatio;
        }
        
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
        }
    }
  };
  
  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleUsePhoto = async () => {
    if (capturedImage) {
        const blob = await(await fetch(capturedImage)).blob();
        const file = new File([blob], "meal.jpg", { type: "image/jpeg" });
        setImage(file);
        setPreview(capturedImage);
        setIsCameraOpen(false);
        setCapturedImage(null);
    }
  };

  const NutritionResult: React.FC<{ info: NutritionInfo }> = ({ info }) => {
    const [editableInfo, setEditableInfo] = useState(info);
    
    const handleInfoChange = (field: keyof Omit<NutritionInfo, 'recipeName' | 'confidence'>, value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            setEditableInfo(prev => ({ ...prev, [field]: numericValue }));
        } else if (value === '') {
             setEditableInfo(prev => ({ ...prev, [field]: 0 }));
        }
    };
    
    const handleLogMeal = () => {
      if (!editableInfo) return;
      setError(null);
      try {
        addLoggedItem({
            name: editableInfo.recipeName,
            carbohydrates: editableInfo.carbohydrates,
            protein: editableInfo.protein,
            fats: editableInfo.fats,
            calories: editableInfo.calories,
            confidence: editableInfo.confidence,
        });
        setIsLogged(true);
      } catch (e) {
        console.error("Failed to save meal log:", e);
        setError(t('couldNotSaveMeal'));
      }
    };

    const EditableField: React.FC<{
        label: string;
        value: number;
        Icon: React.FC<{className?: string}>;
        color: string;
        field: keyof Omit<NutritionInfo, 'recipeName' | 'confidence'>;
        unit: string;
    }> = ({ label, value, Icon, color, field, unit }) => {
        const colorStyles: { [key: string]: { bg: string, text: string, ring: string } } = {
            teal: { bg: 'bg-teal-50 dark:bg-teal-900/50', text: 'text-teal-700 dark:text-teal-300', ring: 'focus:ring-teal-500' },
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', ring: 'focus:ring-blue-500' },
            yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', ring: 'focus:ring-yellow-500' },
            orange: { bg: 'bg-orange-50 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300', ring: 'focus:ring-orange-500' },
        };
        const styles = colorStyles[color];

        return (
             <div className={`${styles.bg} p-4 rounded-xl flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <Icon className={`w-7 h-7 ${styles.text}`} />
                    <label htmlFor={field} className={`font-semibold text-md ${styles.text}`}>{label}</label>
                </div>
                <div className="flex items-center gap-1">
                    <input
                        id={field}
                        type="number"
                        value={value}
                        onChange={(e) => handleInfoChange(field, e.target.value)}
                        className={`w-24 text-right bg-transparent text-xl font-bold text-gray-800 dark:text-white p-1 rounded-md focus:outline-none focus:ring-2 ${styles.ring}`}
                        aria-label={`${label} value`}
                    />
                    <span className={`text-sm font-semibold ${styles.text}`}>{unit}</span>
                </div>
            </div>
        );
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 animate-fadeInUp">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{editableInfo.recipeName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('confidence')} <span className={`font-semibold ${editableInfo.confidence === 'High' ? 'text-green-600 dark:text-green-400' : editableInfo.confidence === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{editableInfo.confidence}</span></p>
          
          <div className="space-y-3 mb-6">
            <EditableField label={t('carbs')} value={editableInfo.carbohydrates} Icon={CubeIcon} color="teal" field="carbohydrates" unit="g" />
            <EditableField label={t('protein')} value={editableInfo.protein} Icon={SteakIcon} color="blue" field="protein" unit="g" />
            <EditableField label={t('fats')} value={editableInfo.fats} Icon={DropletIcon} color="yellow" field="fats" unit="g" />
            <EditableField label={t('calories')} value={editableInfo.calories} Icon={FireIcon} color="orange" field="calories" unit="kcal" />
          </div>
          
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">{error}</p>}
  
          <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                  onClick={handleLogMeal}
                  disabled={isLogged}
                  className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-teal-300 dark:disabled:bg-teal-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                  {isLogged ? (
                      <>
                          <CheckIcon className="w-5 h-5" />
                          <span>{t('logged')}</span>
                      </>
                  ) : (
                      t('logMeal')
                  )}
              </button>
              <button
                  onClick={handleReset}
                  className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                  {t('scanAnother')}
              </button>
          </div>
      </div>
    )
  };

  const CameraUI: React.FC = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center animate-fadeInUp p-4">
      <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
        <video ref={videoRef} className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`} playsInline autoPlay muted />
        {capturedImage && <img src={capturedImage} alt="Captured meal" className="w-full h-full object-contain" />}

        {!capturedImage && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-4 border-2 border-dashed border-white/70 rounded-lg"></div>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => setIsCameraOpen(false)} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors" aria-label={t('closeCamera')}>
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-8 z-10">
        {capturedImage ? (
          <>
            <button onClick={handleRetake} className="bg-white/90 text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-white transition-colors">{t('retake')}</button>
            <button onClick={handleUsePhoto} className="bg-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-teal-600 transition-colors">{t('usePhoto')}</button>
          </>
        ) : (
          hasMultipleCameras ? (
            <>
              <div className="w-16 h-16"></div>
              <button onClick={handleCapture} className="text-white" aria-label={t('takeAPhoto')}>
                <ShutterIcon className="w-20 h-20" />
              </button>
              <button onClick={handleSwitchCamera} className="w-16 h-16 text-white bg-white/20 p-3 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors" aria-label={t('switchCamera')}>
                <ArrowPathIcon className="w-8 h-8" />
              </button>
            </>
          ) : (
            <button onClick={handleCapture} className="text-white" aria-label={t('takeAPhoto')}>
              <ShutterIcon className="w-20 h-20" />
            </button>
          )
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
        {isCameraOpen && <CameraUI />}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('mealScanner')}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-md">{t('mealScannerDescription')}</p>

        {error && !nutritionInfo && (
             <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800 text-center animate-fadeInUp">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />
            {preview ? (
                <div className="text-center">
                    <img src={preview} alt="Meal preview" className="rounded-lg max-h-60 w-auto mx-auto mb-4" />
                     <button
                        onClick={handleReset}
                        className="text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                        {t('chooseDifferentPhoto')}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center space-y-4">
                    <button 
                        onClick={handleTakePhotoClick}
                        className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <CameraIcon className="w-6 h-6" />
                        {t('takeAPhoto')}
                    </button>
                     <div className="flex items-center w-full">
                        <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                        <span className="px-2 text-sm text-gray-400 dark:text-gray-500">{t('or')}</span>
                        <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                    </div>
                    <button 
                        onClick={handleUploadClick}
                        className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowUpOnSquareIcon className="w-5 h-5" />
                        {t('uploadFromGallery')}
                    </button>
                </div>
            )}
        </div>
        
        {image && !isLoading && !nutritionInfo && !error && (
             <button
                onClick={handleAnalyzeClick}
                className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors shadow-md shadow-teal-500/20"
            >
                {t('analyzeMeal')}
            </button>
        )}

        {isLoading && (
            <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('analyzingMeal')}</p>
            </div>
        )}

        {error && !isLoading && !nutritionInfo && image &&(
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl shadow-sm text-center animate-fadeInUp mt-4 border border-red-200 dark:border-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('analysisFailed')}</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                    onClick={handleAnalyzeClick}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                >
                    {t('tryAgain')}
                </button>
            </div>
        )}

        {nutritionInfo && !isLoading && <NutritionResult info={nutritionInfo} />}
    </div>
  );
};

export default MealScanner;