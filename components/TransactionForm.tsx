import React, { useState } from 'react';
import { Transaction, TransactionType, CategoryData } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Wand2, Loader2, X } from 'lucide-react';
import { parseNaturalLanguageTransaction } from '../services/geminiService';

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  categories: CategoryData;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, categories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(categories.expense[0]);
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    
    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date: new Date().toISOString()
    });
    onClose();
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    const result = await parseNaturalLanguageTransaction(aiInput);
    if (result) {
      if (result.amount) setAmount(result.amount.toString());
      if (result.description) setDescription(result.description);
      if (result.type) {
        setType(result.type);
        // Reset category to default of new type if not found, or try to match
        const availableCats = categories[result.type];
        if (result.category && availableCats.includes(result.category)) {
          setCategory(result.category);
        } else {
          setCategory(availableCats[0]);
        }
      }
    }
    setIsParsing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Nouvelle Transaction</h2>

        {/* AI Quick Add */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Wand2 size={12} /> Remplissage Rapide IA
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ex: 'Dépensé 2000 DA pour le déjeuner'"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-400"
            />
            <button 
              onClick={handleAiParse}
              disabled={isParsing || !aiInput}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-6"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(categories.income[0] || ''); }}
              className={`py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${type === 'income' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 shadow-none'}`}
            >
              Revenus
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(categories.expense[0] || ''); }}
              className={`py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 shadow-none'}`}
            >
              Dépenses
            </button>
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">Montant (DA)</label>
            <input 
              type="number" 
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">Description</label>
            <input 
              type="text" 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">Catégorie</label>
            <div className="relative">
                <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none transition-all"
                >
                {categories[type].map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
          >
            Ajouter la Transaction
          </button>
        </form>
      </div>
    </div>
  );
};