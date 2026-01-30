export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO String
  type: TransactionType;
}

export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface CategoryData {
  income: string[];
  expense: string[];
}

export type Budgets = Record<string, number>;

export type Theme = 'light' | 'dark';

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  ADVISOR = 'ADVISOR',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}