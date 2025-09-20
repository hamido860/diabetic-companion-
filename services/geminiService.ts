import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { Recipe, RecipeNutrition } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeMealImage = async (imageFile: File): Promise<any> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                imagePart,
                { text: "Analyze this meal. Identify the food items and estimate the total carbohydrates, protein, fats, and calories. Provide a confidence level for your estimation (High, Medium, or Low). The analysis should be suitable for a person managing their diet." }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recipeName: {
                      type: Type.STRING,
                      description: 'A descriptive name for the meal, like "Grilled Salmon with Asparagus" or "Chicken Salad Sandwich".',
                    },
                    carbohydrates: { 
                        type: Type.NUMBER,
                        description: 'Estimated carbohydrates in grams.'
                    },
                    protein: { 
                        type: Type.NUMBER,
                        description: 'Estimated protein in grams.'
                    },
                    fats: { 
                        type: Type.NUMBER,
                        description: 'Estimated fats in grams.'
                    },
                    calories: {
                        type: Type.NUMBER,
                        description: 'Estimated total calories.'
                    },
                    confidence: {
                        type: Type.STRING,
                        description: 'Confidence level of the estimation: High, Medium, or Low.'
                    }
                },
                // FIX: Corrected typo in schema definition. 'required' is a property, not a peer of 'properties'.
                required: ['recipeName', 'carbohydrates', 'protein', 'fats', 'calories', 'confidence']
            }
        }
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error analyzing meal image:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const getFoodNutritionInfo = async (foodName: string): Promise<any> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a nutritional analysis for "${foodName}", focusing on information relevant to a person managing diabetes. Use the provided JSON schema for the response format.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    foodName: {
                      type: Type.STRING,
                      description: 'The name of the food item, correctly capitalized.',
                    },
                    description: {
                      type: Type.STRING,
                      description: 'A brief, one-sentence description of the food.',
                    },
                    carbohydrates: {
                        type: Type.NUMBER,
                        description: 'Estimated carbohydrates in grams for a typical serving size.'
                    },
                    protein: {
                        type: Type.NUMBER,
                        description: 'Estimated protein in grams for a typical serving size.'
                    },
                    fats: {
                        type: Type.NUMBER,
                        description: 'Estimated fats in grams for a typical serving size.'
                    },
                    calories: {
                        type: Type.NUMBER,
                        description: 'Estimated total calories for a typical serving size.'
                    },
                    glycemicIndex: {
                        type: Type.NUMBER,
                        description: 'Estimated Glycemic Index (GI) of the food. Provide an approximate value.'
                    },
                    servingSize: {
                        type: Type.STRING,
                        description: 'A typical serving size for this food (e.g., "1 cup", "100g", "1 medium apple").'
                    },
                    suitability: {
                        type: Type.STRING,
                        description: 'A suitability rating for diabetics: "Recommended", "Caution", or "Not Recommended".'
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: 'A brief explanation for the suitability rating, focusing on factors like carb content, GI, and fiber.'
                    }
                },
                required: ['foodName', 'description', 'carbohydrates', 'protein', 'fats', 'calories', 'glycemicIndex', 'servingSize', 'suitability', 'reasoning']
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error(`Error analyzing food "${foodName}":`, error);
    throw new Error(`Failed to analyze "${foodName}". Please try a different food or check your connection.`);
  }
};

let chatInstance: Chat | null = null;

export const getChat = (): Chat => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a friendly, reassuring, and knowledgeable AI assistant for individuals managing diabetes. Your tone should be calm and trustworthy. Provide supportive advice, answer questions about food, exercise, and general diabetes management. Do not provide medical advice. If asked for medical advice, gently redirect the user to consult their doctor. Keep responses concise and easy to understand.',
            },
            history: [
              {
                role: 'user',
                parts: [{ text: "Hello, I'm using your app to help manage my diabetes." }],
              },
              {
                role: 'model',
                parts: [{ text: "Hello! I'm here to help. Feel free to ask me anything about food, exercise, or general diabetes management. How can I support you today?" }],
              },
            ]
        });
    }
    return chatInstance;
};

// Helper to extract