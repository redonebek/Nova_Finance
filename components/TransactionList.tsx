import React, { useState, useMemo } from 'react';
import { Transaction, CategoryData } from '../types';
import { GlassCard } from './ui/GlassCard';
import { CategoryIcon } from './ui/CategoryIcon';
import { Trash2, TrendingUp, TrendingDown, Search, Filter, X, Calendar, DollarSign } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryData;
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters State
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Combine categories for dropdown
  const allCategories = useMemo(() => {
    return [...new Set([...categories.income, ...categories.expense])].sort();
  }, [categories]);

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search Term (Description)
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Type Filter
      const matchesType = filterType === 'all' || t.type === filterType;

      // 3. Category Filter
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

      // 4. Date Range
      let matchesDate = true;
      const tDate = new Date(t.date).getTime();
      if (startDate) {
        matchesDate = matchesDate && tDate >= new Date(startDate).getTime();
      }
      if (endDate) {
        // Set end date to end of day
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && tDate <= eDate.getTime();
      }

      // 5. Amount Range
      let matchesAmount = true;
      if (minAmount) {
        matchesAmount = matchesAmount && t.amount >= parseFloat(minAmount);
      }
      if (maxAmount) {
        matchesAmount = matchesAmount && t.amount <= parseFloat(maxAmount);
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate && matchesAmount;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, startDate, endDate, minAmount, maxAmount]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const activeFiltersCount = [
    filterType !== 'all',
    filterCategory !== 'all',
    startDate !== '',
    endDate !== '',
    minAmount !== '',
    maxAmount !== ''
  ].filter(Boolean).length;

  return (
    <GlassCard className="min-h-[600px] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Toutes les Transactions</h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-2 ${showFilters || activeFiltersCount > 0 ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100'}`}
            >
                <Filter size={18} />
                {activeFiltersCount > 0 && <span className="bg-cyan-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
            </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Type */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Type</label>
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="all">Tout</option>
                        <option value="income">Revenus</option>
                        <option value="expense">Dépenses</option>
                    </select>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Catégorie</label>
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                        <option value="all">Toutes</option>
                        {allCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12}/> Dates</label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                </div>

                 {/* Amount Range */}
                 <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><DollarSign size={12}/> Montant (Min - Max)</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="Min"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={clearFilters}
                    className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                    <X size={12} /> Réinitialiser les filtres
                </button>
            </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
              <th className="pb-4 pt-2 font-medium pl-2">Type</th>
              <th className="pb-4 pt-2 font-medium">Description</th>
              <th className="pb-4 pt-2 font-medium">Catégorie</th>
              <th className="pb-4 pt-2 font-medium">Date</th>
              <th className="pb-4 pt-2 font-medium text-right">Montant</th>
              <th className="pb-4 pt-2 font-medium text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                <td className="py-4 pl-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'}`}>
                    {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                </td>
                <td className="py-4 font-medium text-slate-800 dark:text-slate-200">{t.description}</td>
                <td className="py-4 text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <CategoryIcon category={t.category} size={14} className="text-slate-500 dark:text-slate-400" />
                    {t.category}
                  </span>
                </td>
                <td className="py-4 text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                <td className={`py-4 text-right font-bold ${t.type === 'income' ? 'text-cyan-600 dark:text-cyan-400' : 'text-pink-600 dark:text-pink-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} DA
                </td>
                <td className="py-4 text-right pr-2">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  {transactions.length === 0 ? "Aucune transaction trouvée. Ajoutez-en une pour commencer." : "Aucun résultat pour ces filtres."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};