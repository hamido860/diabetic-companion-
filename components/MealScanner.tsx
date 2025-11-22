import React, { useState, useRef, useEffect } from 'react';
import { analyzeMealImage } from '../services/geminiService';
import { NutritionInfo } from '../types';
import { ArrowUpOnSquareIcon, CheckIcon, CubeIcon, SteakIcon, DropletIcon, FireIcon, CameraIcon, ShutterIcon, ArrowPathIcon, XMarkIcon } from './icons/Icons';
import { useLocalization } from '../contexts/LocalizationContext';
import { addLoggedItem } from '../services/logService';

const MealScanner: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLocalization();

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setError(null);
        } catch (err) {
            console.error("Camera access denied:", err);
            setError(t('cameraPermissionDenied'));
            setIsCameraActive(false);
        }
    };

    if (isCameraActive) {
        startCamera();
    }

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current && videoRef.current.srcObject) {
             const currentStream = videoRef.current.srcObject as MediaStream;
             currentStream.getTracks().forEach(track => track.stop());
        }
    };
  }, [isCameraActive, facingMode, t]);

  const handleTakePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;

          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                  if (blob) {
                      const file = new File([blob], "meal_scan.jpg", { type: "image/jpeg" });
                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                      setIsCameraActive(false);
                      setNutritionInfo(null);
                      setIsLogged(false);
                  }
              }, 'image/jpeg', 0.95);
          }
      }
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

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
    setIsCameraActive(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  }
  
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
            teal: { bg: 'bg-brand-dark', text: 'text-brand-yellow', ring: 'focus:ring-brand-yellow' },
            blue: { bg: 'bg-brand-dark', text: 'text-blue-400', ring: 'focus:ring-blue-500' },
            yellow: { bg: 'bg-brand-dark', text: 'text-yellow-400', ring: 'focus:ring-yellow-500' },
            orange: { bg: 'bg-brand-dark', text: 'text-orange-400', ring: 'focus:ring-orange-500' },
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
                        className={`w-24 text-right bg-transparent text-xl font-bold text-brand-offwhite p-1 rounded-md focus:outline-none focus:ring-2 ${styles.ring}`}
                        aria-label={`${label} value`}
                    />
                    <span className={`text-sm font-semibold ${styles.text}`}>{unit}</span>
                </div>
            </div>
        );
    };

    return (
      <div className="bg-brand-olive p-6 rounded-3xl shadow-lg shadow-black/20 animate-fadeInUp">
          <h3 className="text-2xl font-bold text-brand-offwhite mb-2">{editableInfo.recipeName}</h3>
          <p className="text-sm text-brand-beige mb-4">{t('confidence')} <span className={`font-semibold ${editableInfo.confidence === 'High' ? 'text-green-400' : editableInfo.confidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{editableInfo.confidence}</span></p>
          
          <div className="space-y-3 mb-6">
            <EditableField label={t('carbs')} value={editableInfo.carbohydrates} Icon={CubeIcon} color="teal" field="carbohydrates" unit="g" />
            <EditableField label={t('protein')} value={editableInfo.protein} Icon={SteakIcon} color="blue" field="protein" unit="g" />
            <EditableField label={t('fats')} value={editableInfo.fats} Icon={DropletIcon} color="yellow" field="fats" unit="g" />
            <EditableField label={t('calories')} value={editableInfo.calories} Icon={FireIcon} color="orange" field="calories" unit="kcal" />
          </div>
          
          {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
  
          <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-2 border-t border-white/10">
              <button
                  onClick={handleLogMeal}
                  disabled={isLogged}
                  className="w-full bg-brand-yellow text-brand-dark font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-brand-yellow/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="w-full bg-brand-dark text-brand-beige font-semibold py-3 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
              >
                  {t('scanAnother')}
              </button>
          </div>
      </div>
    )
  };

  // Full Screen Camera UI
  if (isCameraActive) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-4 animate-scaleIn">
             <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
             />

             {/* Header */}
             <div className="relative w-full flex justify-end z-10 pt-4 px-2">
                <button onClick={() => setIsCameraActive(false)} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
                    <XMarkIcon className="w-8 h-8" />
                </button>
             </div>

             {/* Controls */}
             <div className="relative w-full max-w-md flex items-center justify-between z-10 pb-8 px-6">
                 <button
                    onClick={toggleCamera}
                    className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
                    aria-label={t('switchCamera')}
                 >
                     <ArrowPathIcon className="w-6 h-6" />
                 </button>

                 <button
                    onClick={handleTakePhoto}
                    className="transform active:scale-95 transition-transform"
                    aria-label={t('takePhoto')}
                 >
                     <ShutterIcon className="w-20 h-20 text-white drop-shadow-lg" />
                 </button>

                 <div className="w-14" /> {/* Spacer for centering */}
             </div>
             <canvas ref={canvasRef} className="hidden" />
          </div>
      );
  }

  return (
    <div className="space-y-4">
        <h1 className="text-4xl font-bold text-brand-offwhite">{t('mealScanner')}</h1>
        <p className="text-brand-beige opacity-80 text-md">{t('mealScannerDescription')}</p>

        {error && !nutritionInfo && !isCameraActive && (
             <div className="bg-red-900/20 p-3 rounded-xl border border-red-800 text-center animate-fadeInUp">
                <p className="text-sm text-red-400">{error}</p>
            </div>
        )}
        
        <div className="bg-brand-olive p-4 rounded-3xl shadow-lg shadow-black/20">
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
            />
            {preview ? (
                <div className="text-center">
                    <img src={preview} alt="Meal preview" className="rounded-lg max-h-80 w-auto mx-auto mb-4 object-cover shadow-md" />
                     <button
                        onClick={handleReset}
                        className="text-sm text-brand-yellow font-semibold hover:underline"
                    >
                        {t('chooseDifferentPhoto')}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-brand-beige/30 rounded-xl text-center space-y-6">
                    <div className="flex gap-4 w-full max-w-sm">
                        <button
                            onClick={() => setIsCameraActive(true)}
                            className="flex-1 bg-brand-primary text-brand-background font-bold py-4 px-4 rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all flex flex-col items-center gap-2"
                        >
                            <CameraIcon className="w-8 h-8" />
                            <span>{t('takePhoto')}</span>
                        </button>
                        <button
                            onClick={handleUploadClick}
                            className="flex-1 bg-brand-surface-highlight text-brand-text font-bold py-4 px-4 rounded-2xl hover:bg-brand-surface-highlight/80 transition-all flex flex-col items-center gap-2 border border-white/5"
                        >
                            <ArrowUpOnSquareIcon className="w-8 h-8" />
                            <span>{t('uploadFromGallery')}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
        
        {image && !isLoading && !nutritionInfo && !error && (
             <button
                onClick={handleAnalyzeClick}
                className="w-full bg-brand-yellow text-brand-dark font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors shadow-md shadow-brand-yellow/20"
            >
                {t('analyzeMeal')}
            </button>
        )}

        {isLoading && (
            <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
                <p className="mt-2 text-brand-beige/80">{t('analyzingMeal')}</p>
            </div>
        )}

        {error && !isLoading && !nutritionInfo && image &&(
            <div className="bg-red-900/20 p-4 rounded-xl shadow-sm text-center animate-fadeInUp mt-4 border border-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-red-400">{t('analysisFailed')}</h3>
                <p className="text-sm text-red-400 mb-4">{error}</p>
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