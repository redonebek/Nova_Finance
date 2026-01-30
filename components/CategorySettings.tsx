import React, { useState } from 'react';
import { CategoryData } from '../types';
import { GlassCard } from './ui/GlassCard';
import { CategoryIcon } from './ui/CategoryIcon';
import { Trash2, Plus, Tag } from 'lucide-react';

interface CategorySettingsProps {
  categories: CategoryData;
  onAddCategory: (type: 'income' | 'expense', name: string) => void;
  onDeleteCategory: (type: 'income' | 'expense', name: string) => void;
}

export const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [newIncome, setNewIncome] = useState('');
  const [newExpense, setNewExpense] = useState('');

  const handleAdd = (type: 'income' | 'expense') => {
    const val = type === 'income' ? newIncome : newExpense;
    if (val.trim()) {
      onAddCategory(type, val.trim());
      if (type === 'income') setNewIncome('');
      else setNewExpense('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Income Categories */}
      <GlassCard className="bg-white dark:bg-slate-900">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Tag size={16} />
            </div>
            Catégories Revenus
        </h3>
        
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder="Nouvelle catégorie..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd('income')}
            />
            <button 
                onClick={() => handleAdd('income')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-3 py-2 transition-colors"
            >
                <Plus size={18} />
            </button>
        </div>

        <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {categories.income.map(cat => (
                <li key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                         <div className="p-1.5 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                            <CategoryIcon category={cat} size={16} />
                         </div>
                         <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{cat}</span>
                    </div>
                    <button 
                        onClick={() => onDeleteCategory('income', cat)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                    >
                        <Trash2 size={14} />
                    </button>
                </li>
            ))}
        </ul>
      </GlassCard>

      {/* Expense Categories */}
      <GlassCard className="bg-white dark:bg-slate-900">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                <Tag size={16} />
            </div>
            Catégories Dépenses
        </h3>
        
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
                placeholder="Nouvelle catégorie..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd('expense')}
            />
            <button 
                onClick={() => handleAdd('expense')}
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-3 py-2 transition-colors"
            >
                <Plus size={18} />
            </button>
        </div>

        <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {categories.expense.map(cat => (
                <li key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                            <CategoryIcon category={cat} size={16} />
                         </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{cat}</span>
                    </div>
                    <button 
                        onClick={() => onDeleteCategory('expense', cat)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                    >
                        <Trash2 size={14} />
                    </button>
                </li>
            ))}
        </ul>
      </GlassCard>
    </div>
  );
};