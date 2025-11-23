import React, { useState } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { FoodNutritionInfo } from '../types';
import { getFoodNutritionInfo } from '../services/geminiService';
import { MagnifyingGlassIcon, XMarkIcon, CubeIcon, SteakIcon, DropletIcon, FireIcon, CheckIcon, ChevronDownIcon } from './icons/Icons';
import { addLoggedItem } from '../services/logService';

// Modal component for displaying nutrition details
const NutritionModal: React.FC<{ info: FoodNutritionInfo; onClose: () => void }> = ({ info, onClose }) => {
    const { t } = useLocalization();
    const [isLogged, setIsLogged] = useState(false);

    const getSuitabilityStyles = (): { text: string; styles: string } => {
        switch (info.suitability) {
            case 'Recommended':
                return { text: t('recommended'), styles: 'bg-green-900/50 text-green-400' };
            case 'Caution':
                return { text: t('caution'), styles: 'bg-yellow-900/50 text-yellow-400' };
            case 'Not Recommended':
                return { text: t('notRecommended'), styles: 'bg-red-900/50 text-red-400' };
            default:
                return { text: '', styles: 'bg-brand-dark text-brand-beige/80' };
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
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div 
                className="bg-brand-olive rounded-md shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-brand-offwhite">{info.foodName}</h3>
                    <p className="text-sm text-brand-beige/80">{info.description}</p>
                </div>
                <button onClick={onClose} className="text-brand-beige/60 hover:text-brand-beige p-1 -m-1">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
                <div>
                    <h4 className="font-semibold text-md mb-2 text-brand-beige">{t('suitability')}</h4>
                    <div className="bg-brand-dark/50 p-4 rounded-xl">
                        <p className={`text-center font-bold text-lg ${suitabilityInfo.styles.replace('bg-', 'text-').replace('/50', '')}`}>
                            {suitabilityInfo.text}
                        </p>
                        <p className="text-sm text-brand-beige/80 mt-2 text-center">{info.reasoning}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-brand-dark/50 p-4 rounded-xl">
                        <p className="text-xs text-brand-beige font-semibold uppercase tracking-wider">{t('glycemicIndex')}</p>
                        <p className="text-2xl font-bold text-brand-offwhite">{info.glycemicIndex}</p>
                    </div>
                    <div className="bg-brand-dark/50 p-4 rounded-xl">
                        <p className="text-xs text-brand-beige font-semibold uppercase tracking-wider">{t('servingSize')}</p>
                        <p className="text-lg font-semibold text-brand-offwhite pt-1.5">{info.servingSize}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {nutritionItems.map(item => (
                        <div key={item.label} className="bg-brand-dark/50 p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <item.Icon className={`w-6 h-6 text-brand-beige/80`} />
                                <span className="font-semibold text-md text-brand-beige">{item.label}</span>
                            </div>
                            <span className="text-lg font-bold text-brand-offwhite">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-brand-dark/50 rounded-b-3xl border-t border-white/10 grid grid-cols-2 gap-3">
                 <button
                    onClick={onClose}
                    className="w-full bg-brand-dark text-brand-beige font-semibold py-2.5 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
                  >
                    {t('close')}
                </button>
                <button
                    onClick={handleLogItem}
                    disabled={isLogged}
                    className="w-full bg-brand-yellow text-brand-dark font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 disabled:bg-brand-yellow/50 disabled:cursor-not-allowed"
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

const FoodCategory: React.FC<{
  category: string;
  foods: { name: string; emoji: string }[];
  onSelect: (foodName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ category, foods, onSelect, isOpen, onToggle }) => {
  return (
    <div className="bg-brand-olive rounded-md shadow-lg shadow-black/20 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl font-bold text-brand-offwhite">{category}</h2>
        <ChevronDownIcon className={`w-6 h-6 text-brand-beige/80 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="p-4 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {foods.map((food) => (
                <button
                  key={food.name}
                  onClick={() => onSelect(food.name)}
                  className="bg-brand-dark p-4 rounded-2xl text-center transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                >
                  <span className="text-4xl">{food.emoji}</span>
                  <p className="font-semibold text-sm text-brand-beige mt-2">{food.name}</p>
                </button>
              ))}
            </div>
          </div>
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
    const [openCategory, setOpenCategory] = useState<string>(t('fruitsAndVegetables'));

    const commonFoods = {
        [t('fruitsAndVegetables')]: [
            { name: "Apple", emoji: "🍎" }, { name: "Broccoli", emoji: "🥦" }, { name: "Avocado", emoji: "🥑" }, { name: "Banana", emoji: "🍌" },
            { name: "Carrot", emoji: "🥕" }, { name: "Spinach", emoji: "🥬" }, { name: "Berries", emoji: "🍓" }, { name: "Orange", emoji: "🍊" },
        ],
        [t('proteinSources')]: [
            { name: "Grilled Salmon", emoji: "🐟" }, { name: "Chicken Breast", emoji: "🍗" }, { name: "Eggs", emoji: "🥚" }, { name: "Almonds", emoji: "🌰" },
            { name: "Tofu", emoji: "⬜" }, { name: "Lentils", emoji: "🫘" }, { name: "Beef", emoji: "🥩" }, { name: "Beans", emoji: "🥫" },
        ],
        [t('grainsAndCarbs')]: [
            { name: "White Rice", emoji: "🍚" }, { name: "Oatmeal", emoji: "🥣" }, { name: "Whole Wheat Bread", emoji: "🍞" }, { name: "Pasta", emoji: "🍝" },
            { name: "Quinoa", emoji: "🌾" }, { name: "Brown Rice", emoji: "🟫" }, { name: "Sweet Potato", emoji: "🍠" }, { name: "Potatoes", emoji: "🥔" },
        ],
        [t('dairyAndAlternatives')]: [
            { name: "Milk", emoji: "🥛" }, { name: "Cheese", emoji: "🧀" }, { name: "Greek Yogurt", emoji: "🍦" }, { name: "Almond Milk", emoji: "🌰" },
        ],
        [t('snacksAndSweets')]: [
            { name: "Dark Chocolate", emoji: "🍫" }, { name: "Popcorn", emoji: "🍿" }, { name: "Walnuts", emoji: "🌰" }, { name: "Potato Chips", emoji: "🥔" },
        ],
        [t('other')]: [
            { name: "Pizza", emoji: "🍕" }, { name: "Coffee", emoji: "☕" }, { name: "Salad", emoji: "🥗" }, { name: "Sushi", emoji: "🍣" },
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

    const handleToggleCategory = (category: string) => {
        setOpenCategory(prev => (prev === category ? '' : category));
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-4 z-10 bg-brand-dark/95 backdrop-blur-sm -mx-4 px-4 pt-2 pb-3 -mt-2 transition-all duration-300 border-b border-white/10">
              <header>
                  <h1 className="text-3xl font-bold text-brand-offwhite">{t('nutrition')}</h1>
                  <p className="text-brand-beige/80 text-sm">{t('nutritionDescription')}</p>
              </header>

              <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchFood')}
                      className="flex-grow p-3 border-2 border-brand-dark bg-brand-dark text-brand-offwhite rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow shadow-sm"
                      aria-label={t('searchFood')}
                  />
                  <button
                      type="submit"
                      className="bg-brand-yellow text-brand-dark p-3 rounded-xl disabled:bg-brand-yellow/50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-brand-yellow/20"
                      disabled={isLoading || !searchQuery.trim()}
                      aria-label={t('getAnalysis')}
                  >
                      <MagnifyingGlassIcon className="w-6 h-6" />
                  </button>
              </form>
            </div>


            {isLoading && (
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
                    <p className="mt-2 text-brand-beige/80">{t('analyzingFood')}</p>
                </div>
            )}
            
            {error && !isLoading && (
                 <div className="bg-red-900/20 p-4 rounded-xl shadow-sm text-center animate-fadeInUp mt-4 border border-red-800">
                    <h3 className="text-lg font-bold text-red-400">{t('analysisFailed')}</h3>
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            )}
            
            <div className="space-y-4">
                {Object.entries(commonFoods).map(([category, foods]) => (
                    <FoodCategory
                        key={category}
                        category={category}
                        foods={foods}
                        onSelect={(food) => { setSearchQuery(food); handleSearch(food); }}
                        isOpen={openCategory === category}
                        onToggle={() => handleToggleCategory(category)}
                    />
                ))}
            </div>

            {nutritionData && !isLoading && <NutritionModal info={nutritionData} onClose={() => setNutritionData(null)} />}
        </div>
    );
};

export default NutritionInfo;