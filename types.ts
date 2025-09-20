export enum ActiveView {
  Dashboard = 'dashboard',
  MealScanner = 'mealScanner',
  AiChat = 'aiChat',
  Logs = 'logs',
  Recipes = 'recipes',
  Learn = 'learn',
}

export interface NutritionInfo {
  recipeName: string;
  carbohydrates: number;
  protein: number;
  fats: number;
  calories: number;
  confidence: string;
}

export interface RecipeNutrition {
  carbohydrates: number;
  protein: number;
  fats: number;
  calories: number;
}

export interface FoodNutritionInfo {
  foodName: string;
  description: string;
  carbohydrates: number;
  protein: number;
  fats: number;
  calories: number;
  glycemicIndex: number;
  servingSize: string;
  suitability: 'Recommended' | 'Caution' | 'Not Recommended';
  reasoning: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
}

export interface RecipeSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  [key: string]: string | null;
}

export type GlucoseStatus = 'Low' | 'Normal' | 'Slightly High' | 'High';

export interface GlucoseLog {
  id: string;
  value: number;
  timestamp: string;
  status: GlucoseStatus;
}
export interface LoggedItem {
  id: string;
  name: string;
  carbohydrates: number;
  protein: number;
  fats: number;
  calories: number;
  confidence?: string;
  loggedAt: string;
}
export interface WeightLog {
  id: string;
  value: number;
  unit: 'kg' | 'lbs';
  timestamp: string;
}