import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction, FinancialStats, Theme, Budgets } from '../types';
import { GlassCard } from './ui/GlassCard';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart, AlertCircle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  stats: FinancialStats;
  theme: Theme;
  budgets: Budgets;
  onUpdateBudget: (category: string, amount: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, stats, theme, budgets, onUpdateBudget }) => {
  
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const recentActivity = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  // Calculate Monthly Spending per Category for Budgeting
  const budgetProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses for current month
    const monthlyExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const grouped = monthlyExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    // Merge with defined budgets keys to ensure we show budgets even if no spending yet
    const allKeys = new Set([...Object.keys(grouped), ...Object.keys(budgets)]);
    
    return Array.from(allKeys).map(cat => {
      const spent = grouped[cat] || 0;
      const limit = budgets[cat] || 0;
      const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
      return { category: cat, spent, limit, percent };
    }).sort((a, b) => (b.limit > 0 ? 1 : 0) - (a.limit > 0 ? 1 : 0)); // Put active budgets first
  }, [transactions, budgets]);

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#1e293b';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Stats Cards */}
      <GlassCard className="lg:col-span-1 border-l-4 border-l-cyan-500 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Recettes Totales</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalIncome.toLocaleString()} DA</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-1 border-l-4 border-l-pink-500 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Dépenses Totales</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalExpense.toLocaleString()} DA</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <ArrowDownRight size={24} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-1 border-l-4 border-l-violet-500 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Solde Net</p>
            <h3 className={`text-3xl font-bold mt-1 ${stats.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500'}`}>
              {stats.balance.toLocaleString()} DA
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <DollarSign size={24} />
          </div>
        </div>
      </GlassCard>

      {/* Main Chart */}
      <GlassCard className="lg:col-span-2 min-h-[400px]">
        <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
           Répartition des Dépenses
        </h3>
        <div className="h-[300px] w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                 <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: tooltipText }}
                    cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4}}
                    formatter={(value: number) => [`${value} DA`, 'Montant']}
                 />
                 <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Aucune donnée de dépense</div>
          )}
        </div>
      </GlassCard>

      {/* Recent Transactions List (Mini) */}
      <GlassCard className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Activité Récente</h3>
        <div className="space-y-4">
          {recentActivity.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{t.description}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <span className={`font-bold ${t.type === 'income' ? 'text-cyan-600 dark:text-cyan-400' : 'text-pink-600 dark:text-pink-400'}`}>
                {t.type === 'income' ? '+' : '-'}{t.amount} DA
              </span>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-slate-400 text-center text-sm py-4">Aucune transaction pour le moment.</p>
          )}
        </div>
      </GlassCard>

      {/* Budget Section */}
      <GlassCard className="lg:col-span-3">
        <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart size={20} className="text-emerald-500" />
            Suivi Budgétaire (Mensuel)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetProgress.map((item) => (
                <div key={item.category} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{item.category}</span>
                        <div className="text-right">
                           {item.limit > 0 ? (
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.spent > item.limit ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {Math.round((item.spent / item.limit) * 100)}%
                                </span>
                           ) : (
                               <span className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle size={10} /> Pas de limite</span>
                           )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                         <span className="text-sm text-slate-500 dark:text-slate-400">Dépensé:</span>
                         <span className="text-sm font-medium text-slate-900 dark:text-white">{item.spent.toLocaleString()} DA</span>
                    </div>

                    <div className="mb-3">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                    item.spent > item.limit 
                                        ? 'bg-red-500' 
                                        : (item.spent / item.limit > 0.8 ? 'bg-orange-500' : 'bg-emerald-500')
                                }`} 
                                style={{ width: `${item.percent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Budget Max:</label>
                        <input 
                            type="number"
                            placeholder="Définir..."
                            defaultValue={item.limit || ''}
                            onBlur={(e) => onUpdateBudget(item.category, parseFloat(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 text-right"
                        />
                        <span className="text-xs text-slate-500">DA</span>
                    </div>
                </div>
            ))}
            {budgetProgress.length === 0 && (
                <div className="col-span-full text-center text-slate-400 py-8">
                    Aucune dépense ce mois-ci pour configurer un budget.
                </div>
            )}
        </div>
      </GlassCard>
    </div>
  );
};