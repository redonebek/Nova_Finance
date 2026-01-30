import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ViewMode, FinancialStats, CategoryData, Theme, Budgets } from './types';
import { MOCK_TRANSACTIONS, DEFAULT_CATEGORIES } from './constants';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { AIAdvisor } from './components/AIAdvisor';
import { Reports } from './components/Reports';
import { CategorySettings } from './components/CategorySettings';
import { LayoutDashboard, List, Bot, Plus, Wallet, PieChart, Settings, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nova_theme') as Theme) || 'light';
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nova_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  // Categories State
  const [categories, setCategories] = useState<CategoryData>(() => {
    const saved = localStorage.getItem('nova_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Budgets State
  const [budgets, setBudgets] = useState<Budgets>(() => {
    const saved = localStorage.getItem('nova_budgets');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- EFFECTS ---

  // Persist Theme & Apply Class
  useEffect(() => {
    localStorage.setItem('nova_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist Transactions
  useEffect(() => {
    localStorage.setItem('nova_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Persist Categories
  useEffect(() => {
    localStorage.setItem('nova_categories', JSON.stringify(categories));
  }, [categories]);

  // Persist Budgets
  useEffect(() => {
    localStorage.setItem('nova_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // --- HELPERS ---

  const stats: FinancialStats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);

  // --- ACTIONS ---

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (type: 'income' | 'expense', name: string) => {
    if (!categories[type].includes(name)) {
      setCategories(prev => ({
        ...prev,
        [type]: [...prev[type], name]
      }));
    }
  };

  const deleteCategory = (type: 'income' | 'expense', name: string) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c !== name)
    }));
  };

  const updateBudget = (category: string, amount: number) => {
    setBudgets(prev => ({
      ...prev,
      [category]: amount
    }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-cyan-200 selection:text-cyan-900 transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-64 h-full hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-sm z-10 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white">
            <Wallet size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nova<span className="text-cyan-600 dark:text-cyan-400">Finance</span></h1>
        </div>

        <div className="space-y-2 flex-1">
          <NavButton 
            active={viewMode === ViewMode.DASHBOARD} 
            onClick={() => setViewMode(ViewMode.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="Tableau de Bord" 
          />
          <NavButton 
            active={viewMode === ViewMode.TRANSACTIONS} 
            onClick={() => setViewMode(ViewMode.TRANSACTIONS)} 
            icon={<List size={20} />} 
            label="Transactions" 
          />
          <NavButton 
            active={viewMode === ViewMode.REPORTS} 
            onClick={() => setViewMode(ViewMode.REPORTS)} 
            icon={<PieChart size={20} />} 
            label="Rapports" 
          />
          <NavButton 
            active={viewMode === ViewMode.ADVISOR} 
            onClick={() => setViewMode(ViewMode.ADVISOR)} 
            icon={<Bot size={20} />} 
            label="Conseiller IA" 
            isAi
          />
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <NavButton 
                active={viewMode === ViewMode.SETTINGS} 
                onClick={() => setViewMode(ViewMode.SETTINGS)} 
                icon={<Settings size={20} />} 
                label="Paramètres" 
            />

            <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                <span className="font-medium">{theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}</span>
            </button>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Solde Total</p>
                <p className={`text-xl font-bold ${stats.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{stats.balance.toLocaleString()} DA</p>
            </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
            <Wallet className="text-cyan-600 dark:text-cyan-400" size={24} />
            <span className="font-bold text-slate-900 dark:text-white text-lg">NovaFinance</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <button 
                onClick={() => setShowAddModal(true)}
                className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-cyan-600/20 active:scale-95 transition-transform"
            >
                <Plus size={24} />
            </button>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 flex justify-around p-3 pb-safe transition-colors duration-300">
          <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.DASHBOARD ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
              <LayoutDashboard size={24} />
              <span className="text-[10px] font-medium">Accueil</span>
          </button>
          <button onClick={() => setViewMode(ViewMode.TRANSACTIONS)} className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.TRANSACTIONS ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
              <List size={24} />
              <span className="text-[10px] font-medium">Liste</span>
          </button>
          <button onClick={() => setViewMode(ViewMode.REPORTS)} className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.REPORTS ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
              <PieChart size={24} />
              <span className="text-[10px] font-medium">Rapports</span>
          </button>
          <button onClick={() => setViewMode(ViewMode.SETTINGS)} className={`flex flex-col items-center gap-1 ${viewMode === ViewMode.SETTINGS ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
              <Settings size={24} />
              <span className="text-[10px] font-medium">Options</span>
          </button>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 lg:p-10 pb-24 lg:pb-10">
            <header className="flex justify-between items-center mb-8 hidden lg:flex">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {viewMode === ViewMode.DASHBOARD && 'Tableau de Bord'}
                        {viewMode === ViewMode.TRANSACTIONS && 'Transactions'}
                        {viewMode === ViewMode.REPORTS && 'Rapports Financiers'}
                        {viewMode === ViewMode.ADVISOR && 'Conseiller Financier'}
                        {viewMode === ViewMode.SETTINGS && 'Paramètres'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {viewMode === ViewMode.DASHBOARD && 'Bon retour, voici votre aperçu financier.'}
                        {viewMode === ViewMode.TRANSACTIONS && 'Gérez et suivez vos revenus et dépenses.'}
                        {viewMode === ViewMode.REPORTS && 'Analysez vos performances sur le long terme.'}
                        {viewMode === ViewMode.ADVISOR && 'Propulsé par Gemini 3 Pro. Demandez n\'importe quoi.'}
                        {viewMode === ViewMode.SETTINGS && 'Gérez vos préférences et catégories.'}
                    </p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-900/20"
                >
                    <Plus size={20} /> Ajouter
                </button>
            </header>

            {viewMode === ViewMode.DASHBOARD && (
              <Dashboard 
                transactions={transactions} 
                stats={stats} 
                theme={theme} 
                budgets={budgets} 
                onUpdateBudget={updateBudget} 
              />
            )}
            {viewMode === ViewMode.TRANSACTIONS && <TransactionList transactions={transactions} categories={categories} onDelete={deleteTransaction} />}
            {viewMode === ViewMode.REPORTS && <Reports transactions={transactions} theme={theme} />}
            {viewMode === ViewMode.ADVISOR && <AIAdvisor transactions={transactions} />}
            {viewMode === ViewMode.SETTINGS && <CategorySettings categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory} />}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionForm 
            onAdd={addTransaction} 
            onClose={() => setShowAddModal(false)} 
            categories={categories}
        />
      )}
    </div>
  );
};

// Helper Component for Nav
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isAi?: boolean }> = ({ active, onClick, icon, label, isAi }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
        ${active 
            ? (isAi ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold shadow-sm' : 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm') 
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
        <span className={`${active ? (isAi ? 'text-violet-600 dark:text-violet-400' : 'text-cyan-600 dark:text-cyan-400') : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
            {icon}
        </span>
        <span className="font-medium">{label}</span>
    </button>
);

export default App;