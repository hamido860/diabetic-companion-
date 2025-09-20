import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { FoodNutritionInfo } from '../types';
import { getFoodNutritionInfo } from '../services/geminiService';
import { MagnifyingGlassIcon, XMarkIcon, CubeIcon, SteakIcon, DropletIcon, FireIcon, CheckIcon } from './icons/Icons';
import { addLoggedItem } from '../services/logService';

// Modal component for displaying nutrition details
const NutritionModal: React.FC<{ info: FoodNutritionInfo; onClose: () => void }> = ({ info, onClose }) => {
    const { t } = useLocalization();
    const [isLogged, setIsLogged] = useState(false);

    const getSuitabilityStyles = (): { text: string; styles: string } => {
        switch (info.suitability) {
            case 'Recommended':
                return { text: t('recommended'), styles: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' };
            case 'Caution':
                return { text: t('caution'), styles: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' };
            case 'Not Recommended':
                return { text: t('notRecommended'), styles: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' };
            default:
                return { text: '', styles: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
        }
    };
    
    const handleLogItem = () => {
        if (isLogged) return;
        try {
            addLoggedItem({
                name: info.foodName,
                carbohydrates: info.carbohydrates,
                protein: info.protein,
                fats: info.fats,
                calories: info.calories,
            });
            setIsLogged(true);
        } catch (error) {
            console.error("Failed to log item:", error);
            // Optionally show an error to the user
        }
    };

    const suitabilityInfo = getSuitabilityStyles();
    
    const nutritionItems = [
      { label: t('carbs'), value: `${info.carbohydrates}g`, Icon: CubeIcon },
      { label: t('protein'), value: `${info.protein}g`, Icon: SteakIcon },
      { label: t('fats'), value: `${info.fats}g`, Icon: DropletIcon },
      { label: t('calories'), value: `${Math.round(info.calories)}`, Icon: FireIcon },
    ];

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{info.foodName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{info.description}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
                <div>
                    <h4 className="font-semibold text-md mb-2 text-gray-700 dark:text-gray-300">{t('suitability')}</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        <p className={`text-center font-bold text-lg ${suitabilityInfo.styles.replace('bg-', 'text-').replace('/50', '')}`}>
                            {suitabilityInfo.text}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">{info.reasoning}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{t('glycemicIndex')}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{info.glycemicIndex}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{t('servingSize')}</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white pt-1.5">{info.servingSize}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {nutritionItems.map(item => (
                        <div key={item.label} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <item.Icon className={`w-6 h-6 text-gray-500 dark:text-gray-400`} />
                                <span className="font-semibold text-md text-gray-700 dark:text-gray-300">{item.label}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
                 <button
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('close')}
                </button>
                <button
                    onClick={handleLogItem}
                    disabled={isLogged}
                    className="w-full bg-teal-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:bg-teal-300 dark:disabled:bg-teal-800 disabled:cursor-not-allowed"
                >
                    {isLogged ? (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            <span>{t('logged')}</span>
                        </>
                    ) : (
                        t('logThisItem')
                    )}
                </button>
            </div>
          </div>
        </div>
    );
};


const NutritionInfo: React.FC = () => {
    const { t } = useLocalization();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nutritionData, setNutritionData] = useState<FoodNutritionInfo | null>(null);

    const commonFoods = {
        [t('fruitsAndVegetables')]: [
            { name: "Apple", emoji: "🍎" },
            { name: "Broccoli", emoji: "🥦" },
            { name: "Avocado", emoji: "🥑" },
            { name: "Banana", emoji: "🍌" },
            { name: "Carrot", emoji: "🥕" },
            { name: "Spinach", emoji: "🥬" },
            { name: "Berries", emoji: "🍓" },
            { name: "Orange", emoji: "🍊" },
            { name: "Tomato", emoji: "🍅" },
            { name: "Cucumber", emoji: "🥒" },
            { name: "Grapes", emoji: "🍇" },
            { name: "Bell Pepper", emoji: "🫑" },
        ],
        [t('proteinSources')]: [
            { name: "Grilled Salmon", emoji: "🐟" },
            { name: "Chicken Breast", emoji: "🍗" },
            { name: "Eggs", emoji: "🥚" },
            { name: "Almonds", emoji: "🌰" },
            { name: "Tofu", emoji: "⬜" },
            { name: "Lentils", emoji: "🫘" },
            { name: "Beef", emoji: "🥩" },
            { name: "Beans", emoji: "🥫" },
            { name: "Shrimp", emoji: "🦐" },
            { name: "Pork Chop", emoji: "🐖" },
            { name: "Turkey", emoji: "🦃" },
            { name: "Peanut Butter", emoji: "🥜" },
        ],
        [t('grainsAndCarbs')]: [
            { name: "White Rice", emoji: "🍚" },
            { name: "Oatmeal", emoji: "🥣" },
            { name: "Whole Wheat Bread", emoji: "🍞" },
            { name: "Pasta", emoji: "🍝" },
            { name: "Quinoa", emoji: "🌾" },
            { name: "Brown Rice", emoji: "🟫" },
            { name: "Sweet Potato", emoji: "🍠" },
            { name: "Chickpeas", emoji: "🥣" },
            { name: "Potatoes", emoji: "🥔" },
            { name: "Cereal", emoji: "🥣" },
            { name: "Bagel", emoji: "🥯" },
            { name: "Corn", emoji: "🌽" },
        ],
        [t('dairyAndAlternatives')]: [
            { name: "Milk", emoji: "🥛" },
            { name: "Cheese", emoji: "🧀" },
            { name: "Greek Yogurt", emoji: "🍦" },
            { name: "Almond Milk", emoji: "🌰" },
            { name: "Soy Milk", emoji: "🌱" },
            { name: "Cottage Cheese", emoji: "🧀" },
            { name: "Butter", emoji: "🧈" },
            { name: "Kefir", emoji: "🥤" },
        ],
        [t('snacksAndSweets')]: [
            { name: "Dark Chocolate", emoji: "🍫" },
            { name: "Popcorn", emoji: "🍿" },
            { name: "Walnuts", emoji: "🌰" },
            { name: "Croissant", emoji: "🥐" },
            { name: "Potato Chips", emoji: "🥔" },
            { name: "Ice Cream", emoji: "🍨" },
            { name: "Honey", emoji: "🍯" },
            { name: "Pretzels", emoji: "🥨" },
        ],
        [t('other')]: [
            { name: "Pizza", emoji: "🍕" },
            { name: "Coffee", emoji: "☕" },
            { name: "Soup", emoji: "🍲" },
            { name: "Salad", emoji: "🥗" },
            { name: "Sushi", emoji: "🍣" },
            { name: "Taco", emoji: "🌮" },
            { name: "Hamburger", emoji: "🍔" },
            { name: "French Fries", emoji: "🍟" },
        ]
    };

    const handleSearch = async (foodName: string) => {
        if (!foodName.trim()) return;
        setIsLoading(true);
        setError(null);
        setNutritionData(null);

        try {
            const data = await getFoodNutritionInfo(foodName);
            setNutritionData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-4 z-10 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-4 px-4 pt-2 pb-3 -mt-2 transition-all duration-300 border-b border-gray-200 dark:border-gray-700/50">
              <header>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nutrition')}</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('nutritionDescription')}</p>
              </header>

              <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchFood')}
                      className="flex-grow p-3 border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow shadow-sm"
                      aria-label={t('searchFood')}
                  />
                  <button
                      type="submit"
                      className="bg-teal-500 text-white p-3 rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-teal-500/20"
                      disabled={isLoading || !searchQuery.trim()}
                      aria-label={t('getAnalysis')}
                  >
                      <MagnifyingGlassIcon className="w-6 h-6" />
                  </button>
              </form>
            </div>


            {isLoading && (
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{t('analyzingFood')}</p>
                </div>
            )}
            
            {error && !isLoading && (
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl shadow-sm text-center animate-fadeInUp mt-4 border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('analysisFailed')}</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}
            
            <div className="space-y-6">
                {Object.entries(commonFoods).map(([category, foods]) => (
                    <div key={category}>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{category}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {foods.map((food) => (
                                <button
                                    key={food.name}
                                    onClick={() => {
                                        setSearchQuery(food.name);
                                        handleSearch(food.name);
                                    }}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                                >
                                    <span className="text-4xl">{food.emoji}</span>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mt-2">{food.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {nutritionData && !isLoading && <NutritionModal info={nutritionData} onClose={() => setNutritionData(null)} />}
        </div>
    );
};

export default NutritionInfo;