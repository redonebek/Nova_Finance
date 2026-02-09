import React, { useState, useMemo } from 'react';
import { Transaction, Theme } from '../types';
import { GlassCard } from './ui/GlassCard';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie } from 'recharts';
import { Calendar, TrendingUp, Layers, PieChart as PieChartIcon } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  theme: Theme;
}

type Period = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMESTERLY' | 'YEARLY';

interface ReportDataPoint {
  key: string;
  name: string;
  income: number;
  expense: number;
  balance: number;
  sortTime: number;
}

export const Reports: React.FC<ReportsProps> = ({ transactions, theme }) => {
  const [period, setPeriod] = useState<Period>('MONTHLY');

  const processedData = useMemo(() => {
    // Helper pour le numéro de semaine (ISO 8601 simple)
    const getWeekNumber = (d: Date) => {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
        return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    };

    // Helper to get sortable key and display name
    const getData = (t: Transaction) => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      
      if (period === 'WEEKLY') {
        const week = getWeekNumber(date);
        return {
            key: `${year}-W${week}`,
            name: `Sem ${week}`, // Ex: Sem 42
            sortTime: new Date(year, 0, (week - 1) * 7).getTime() // Approximation pour le tri
        };
      } else if (period === 'MONTHLY') {
        const month = date.getMonth();
        return {
          key: `${year}-${String(month + 1).padStart(2, '0')}`,
          name: date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
          sortTime: new Date(year, month).getTime()
        };
      } else if (period === 'QUARTERLY') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return {
          key: `${year}-Q${quarter}`,
          name: `T${quarter} ${year}`,
          sortTime: new Date(year, (quarter - 1) * 3).getTime()
        };
      } else if (period === 'SEMESTERLY') {
        const semester = date.getMonth() < 6 ? 1 : 2;
        return {
            key: `${year}-S${semester}`,
            name: `S${semester} ${year}`,
            sortTime: new Date(year, (semester - 1) * 6).getTime()
        };
      } else {
        return {
          key: `${year}`,
          name: `${year}`,
          sortTime: new Date(year, 0).getTime()
        };
      }
    };

    const grouped = transactions.reduce<Record<string, ReportDataPoint>>((acc, t) => {
      const { key, name, sortTime } = getData(t);
      
      if (!acc[key]) {
        acc[key] = {
          key,
          name,
          income: 0,
          expense: 0,
          balance: 0,
          sortTime
        };
      }
      
      const entry = acc[key];

      if (t.type === 'income') {
        entry.income += t.amount;
      } else {
        entry.expense += t.amount;
      }
      entry.balance = entry.income - entry.expense;
      
      return acc;
    }, {});

    return (Object.values(grouped)).sort((a, b) => a.sortTime - b.sortTime);
  }, [transactions, period]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totals = useMemo(() => {
    return processedData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      balance: acc.balance + curr.balance
    }), { income: 0, expense: 0, balance: 0 });
  }, [processedData]);

  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#1e293b';

  const PIE_COLORS = ['#0891b2', '#db2777', '#7c3aed', '#ea580c', '#16a34a', '#ca8a04', '#2563eb'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <GlassCard className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="text-center xl:text-left">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rapports Financiers</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Analysez vos tendances sur différentes périodes.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
          <button
            onClick={() => setPeriod('WEEKLY')}
            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${period === 'WEEKLY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Hebdo
          </button>
          <button
            onClick={() => setPeriod('MONTHLY')}
            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${period === 'MONTHLY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setPeriod('QUARTERLY')}
            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${period === 'QUARTERLY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Trimestriel
          </button>
          <button
            onClick={() => setPeriod('SEMESTERLY')}
            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${period === 'SEMESTERLY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Semestriel
          </button>
          <button
            onClick={() => setPeriod('YEARLY')}
            className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${period === 'YEARLY' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Annuel
          </button>
        </div>
      </GlassCard>

      {/* Main Trends Chart */}
      <GlassCard className="h-[400px]">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-600 dark:text-violet-400" />
          Évolution Recettes vs Dépenses
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#db2777" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#db2777" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              formatter={(value: number) => [`${value.toLocaleString()} DA`, '']}
            />
            <Legend iconType="circle" />
            <Area type="monotone" dataKey="income" name="Recettes" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" name="Dépenses" stroke="#db2777" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Breakdown Grid: Net Balance + Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Balance Trend */}
         <GlassCard className="h-[350px]">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
            Solde Net par Période
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: theme === 'dark' ? '#334155' : '#f1f5f9'}}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Solde']}
              />
              <Bar dataKey="balance" fill="#10b981" radius={[4, 4, 4, 4]}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.balance >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Expenses Pie Chart (New) */}
        <GlassCard className="h-[350px]">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <PieChartIcon size={18} className="text-orange-600 dark:text-orange-400" />
                Répartition des Dépenses
            </h3>
            <div className="w-full h-full flex justify-center pb-8">
                {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Montant']}
                            />
                            <Legend 
                                layout="vertical" 
                                verticalAlign="middle" 
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', color: textColor }} 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center text-slate-400 text-sm">Aucune dépense enregistrée</div>
                )}
            </div>
        </GlassCard>
      </div>

      {/* Detailed Summary Table */}
      <GlassCard className="overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
        Détails de la Période
        </h3>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
            <tr>
                <th className="px-4 py-3 rounded-l-lg">Période</th>
                <th className="px-4 py-3 text-right">Recettes</th>
                <th className="px-4 py-3 text-right">Dépenses</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Solde</th>
            </tr>
            </thead>
            <tbody className="text-slate-300">
            {processedData.slice().reverse().map((item) => (
                <tr key={item.key} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                <td className="px-4 py-3 text-right text-cyan-600 dark:text-cyan-400 font-medium">+{item.income.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-pink-600 dark:text-pink-400 font-medium">-{item.expense.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-bold ${item.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {item.balance > 0 ? '+' : ''}{item.balance.toLocaleString()}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            <span>Total Visible</span>
            <span className={totals.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {totals.balance > 0 ? '+' : ''}{totals.balance.toLocaleString()} DA
            </span>
        </div>
      </GlassCard>
    </div>
  );
};