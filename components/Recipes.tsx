import React, { useState, useEffect } from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Recipe, RecipeSummary, Category, RecipeNutrition } from '../types';
import { translateRecipe, analyzeRecipeNutrition } from '../services/geminiService';
import { ArrowLeftIcon, ChartLineIcon, XMarkIcon, CubeIcon, SteakIcon, DropletIcon, FireIcon } from './icons/Icons';

// Helper function to extract ingredients from a recipe object
const getIngredients = (recipe: Recipe): string[] => {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim());
    }
  }
  return ingredients;
};

// New Nutrition Modal Component
const NutritionModal: React.FC<{
  nutrition: RecipeNutrition;
  recipeName: string;
  onClose: () => void;
}> = ({ nutrition, recipeName, onClose }) => {
    const { t } = useLocalization();

    const nutritionItems = [
        { label: t('carbs'), value: Math.round(nutrition.carbohydrates), Icon: CubeIcon, color: 'teal', unit: 'g' },
        { label: t('protein'), value: Math.round(nutrition.protein), Icon: SteakIcon, color: 'blue', unit: 'g' },
        { label: t('fats'), value: Math.round(nutrition.fats), Icon: DropletIcon, color: 'yellow', unit: 'g' },
        { label: t('calories'), value: Math.round(nutrition.calories), Icon: FireIcon, color: 'orange', unit: 'kcal' },
    ];

    const NutrientDisplay: React.FC<{ label: string; value: number; unit: string; Icon: React.FC<{className?: string}>; color: string; }> = ({ label, value, unit, Icon, color }) => {
         const colorStyles: { [key: string]: { bg: string, text: string } } = {
            teal: { bg: 'bg-teal-50 dark:bg-teal-900/50', text: 'text-teal-700 dark:text-teal-300' },
            blue: { bg: 'bg-blue-50 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300' },
            yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300' },
            orange: { bg: 'bg-orange-50 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300' },
        };
        const styles = colorStyles[color];
        return (
            <div className={`${styles.bg} p-4 rounded-xl flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <Icon className={`w-7 h-7 ${styles.text}`} />
                    <span className={`font-semibold text-md ${styles.text}`}>{label}</span>
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
                    <p className={`text-sm font-semibold ${styles.text}`}>{unit}</p>
                </div>
            </div>
        )
    }

    return (
         <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 animate-fadeInUp"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t('nutritionAnalysis')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('nutritionInfoFor')} "{recipeName}"</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 -m-1">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3">
                {nutritionItems.map(item => <NutrientDisplay key={item.label} {...item} />)}
                 <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-3">{t('estimatedTotalNutrition')}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={onClose}
                    className="w-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    {t('close')}
                </button>
            </div>
          </div>
        </div>
    )
};

// Component for the detailed recipe view
const RecipeDetailView: React.FC<{ recipe: Recipe; onBack: () => void }> = ({ recipe, onBack }) => {
    const { language, t } = useLocalization();
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const [content, setContent] = useState({
        title: recipe.strMeal,
        instructions: recipe.strInstructions,
        ingredients: getIngredients(recipe)
    });
    const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);
    const [nutritionInfo, setNutritionInfo] = useState<RecipeNutrition | null>(null);
    const [nutritionError, setNutritionError] = useState<string | null>(null);

    useEffect(() => {
        const doTranslate = async () => {
            if (language === 'en') {
                setContent({ title: recipe.strMeal, instructions: recipe.strInstructions, ingredients: getIngredients(recipe) });
                setTranslationError(null);
                return;
            }
            setIsTranslating(true);
            setTranslationError(null);
            try {
                const translated = await translateRecipe(recipe, language);
                setContent({ title: translated.strMeal, instructions: translated.strInstructions, ingredients: translated.ingredients });
            } catch (e) {
                console.error("Failed to translate:", e);
                setTranslationError(t('translationFailed'));
                setContent({ title: recipe.strMeal, instructions: recipe.strInstructions, ingredients: getIngredients(recipe) });
            } finally {
                setIsTranslating(false);
            }
        };
        if (recipe) doTranslate();
    }, [recipe, language, t]);

    const handleAnalyzeNutrition = async () => {
        if (!recipe) return;
        setIsAnalyzingNutrition(true);
        setNutritionError(null);
        setNutritionInfo(null);
        try {
            const result = await analyzeRecipeNutrition(recipe);
            setNutritionInfo(result);
        } catch (e) {
            setNutritionError(t('analysisFailed'));
        } finally {
            setIsAnalyzingNutrition(false);
        }
    };

    return (
        <div className="animate-fadeInUp">
            {nutritionInfo && (
                <NutritionModal 
                    nutrition={nutritionInfo}
                    recipeName={content.title}
                    onClose={() => setNutritionInfo(null)}
                />
            )}
            <header className="mb-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    aria-label="Back to recipes"
                >
                    <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
            </header>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden">
                <img src={recipe.strMealThumb} alt={content.title} className="w-full h-64 object-cover" />
                <div className="p-6 md:p-8">
                    {isTranslating ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            <p className="mt-3 text-gray-500 dark:text-gray-400">{t('translating')}</p>
                        </div>
                    ) : (
                        <>
                            {translationError && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg text-center mb-4 border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">{translationError}</p>
                                </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                                <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{content.title}</h3>
                                <button
                                    onClick={handleAnalyzeNutrition}
                                    disabled={isAnalyzingNutrition}
                                    className="flex items-center justify-center gap-2 bg-teal-50 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300 font-semibold py-2.5 px-5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-wait shrink-0"
                                >
                                    {isAnalyzingNutrition ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                                    ) : (
                                        <ChartLineIcon className="w-5 h-5" />
                                    )}
                                    <span>{isAnalyzingNutrition ? t('analyzing') : t('viewNutrition')}</span>
                                </button>
                            </div>

                             {nutritionError && (
                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center mb-4 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-700 dark:text-red-300">{nutritionError}</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
                                    <h4 className="font-bold text-xl mb-3 text-gray-700 dark:text-gray-300 border-b-2 border-teal-500 pb-2">{t('ingredients')}</h4>
                                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                        {content.ingredients.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-teal-500 mt-1.5">&#8226;</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="font-bold text-xl mb-3 text-gray-700 dark:text-gray-300 border-b-2 border-teal-500 pb-2">{t('instructions')}</h4>
                                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                        {content.instructions}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
  
const RecipeCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        <div className="w-full h-28 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const Recipes: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Beef');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<Recipe | null>(null);
  
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setError(null);
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories.');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);
  
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      setError(null);
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setRecipes(data.meals || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to fetch recipes for ${selectedCategory}.`);
        setRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [selectedCategory]);

  const handleSelectRecipe = async (recipeSummary: RecipeSummary) => {
    setActiveRecipeId(recipeSummary.idMeal);
    setIsFetchingDetails(true);
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeSummary.idMeal}`);
        if (!response.ok) throw new Error('Failed to fetch recipe details.');
        const data = await response.json();
        if (data.meals && data.meals.length > 0) {
            setSelectedRecipeDetails(data.meals[0]);
        } else {
            throw new Error('Recipe not found.');
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsFetchingDetails(false);
        setActiveRecipeId(null);
    }
  };

  if (selectedRecipeDetails) {
    return <RecipeDetailView recipe={selectedRecipeDetails} onBack={() => setSelectedRecipeDetails(null)} />;
  }
  
  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-10 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-4 px-4 pt-2 pb-3 -mt-2 transition-all duration-300 border-b border-gray-200 dark:border-gray-700/50">
        <header>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('healthyRecipes')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('healthyRecipesDescription')}</p>
        </header>

        <div className="mt-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">{t('categories')}</h2>
          <div className="flex space-x-3 rtl:space-x-reverse overflow-x-auto pb-2 -mb-2">
            {isLoadingCategories ? (
              <>
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0"></div>
                  <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0"></div>
                  <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0"></div>
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0"></div>
              </>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.idCategory}
                  onClick={() => setSelectedCategory(cat.strCategory)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    selectedCategory === cat.strCategory
                      ? 'bg-teal-500 text-white shadow'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  {cat.strCategory}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('oops')}</h3>
          <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {isLoadingRecipes ? (
          Array.from({ length: 6 }).map((_, i) => <RecipeCardSkeleton key={i} />)
        ) : (
          recipes.map((recipe) => (
            <button key={recipe.idMeal} onClick={() => handleSelectRecipe(recipe)} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden text-left transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 relative">
              <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-full h-28 object-cover" />
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 leading-tight">{recipe.strMeal}</h3>
              </div>
              {isFetchingDetails && activeRecipeId === recipe.idMeal && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                  </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Recipes;