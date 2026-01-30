import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const getFinancialAdvice = async (transactions: Transaction[], userQuery: string): Promise<string> => {
  if (!apiKey) return "La clé API est manquante. Veuillez la configurer.";

  const transactionSummary = transactions.map(t => 
    `${t.date.split('T')[0]}: ${t.type === 'income' ? 'REVENU' : 'DÉPENSE'} - ${t.amount} DA (${t.category}) - ${t.description}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Tu es Nova, un expert et conseiller financier IA.
        Analyse l'historique des transactions suivant (en Dinars Algériens DA) et réponds à la question de l'utilisateur en FRANÇAIS.
        Sois concis, amical et adopte un ton futuriste. Utilise les emojis avec parcimonie.
        
        Historique des Transactions:
        ${transactionSummary}

        Question de l'utilisateur:
        ${userQuery}
      `,
    });
    return response.text || "Je n'ai pas pu générer de conseil pour le moment.";
  } catch (error) {
    console.error("Gemini Advisor Error:", error);
    return "J'ai rencontré une erreur lors de l'analyse de vos finances. Veuillez réessayer plus tard.";
  }
};

export const parseNaturalLanguageTransaction = async (input: string): Promise<Partial<Transaction> | null> => {
  if (!apiKey) return null;

  const incomeCategories = DEFAULT_CATEGORIES.income.join(', ');
  const expenseCategories = DEFAULT_CATEGORIES.expense.join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse ce texte financier en français en un objet JSON avec les clés : 'amount' (number), 'description' (string), 'type' (enum: 'income' ou 'expense'), 'category' (string). 
      La date actuelle est ${new Date().toISOString()}.
      Les catégories de revenus valides sont : ${incomeCategories}.
      Les catégories de dépenses valides sont : ${expenseCategories}.
      Essaie de faire correspondre la catégorie au mieux.
      
      Entrée : "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['income', 'expense'] },
            category: { type: Type.STRING }
          },
          required: ['amount', 'description', 'type', 'category']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Parser Error:", error);
    return null;
  }
};