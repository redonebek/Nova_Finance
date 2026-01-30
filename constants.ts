import { Transaction, CategoryData } from './types';

export const DEFAULT_CATEGORIES: CategoryData = {
  income: ['Salaire', 'Freelance', 'Investissements', 'Cadeaux', 'Autre'],
  expense: ['Logement', 'Alimentation', 'Transport', 'Divertissement', 'Santé', 'Shopping', 'Factures', 'Autre']
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 60000,
    description: 'Salaire Mensuel',
    category: 'Salaire',
    date: new Date(new Date().setDate(1)).toISOString(),
    type: 'income'
  },
  {
    id: '2',
    amount: 25000,
    description: 'Loyer',
    category: 'Logement',
    date: new Date(new Date().setDate(3)).toISOString(),
    type: 'expense'
  },
  {
    id: '3',
    amount: 8500,
    description: 'Courses Semaine',
    category: 'Alimentation',
    date: new Date(new Date().setDate(5)).toISOString(),
    type: 'expense'
  },
  {
    id: '4',
    amount: 15000,
    description: 'Projet Freelance',
    category: 'Freelance',
    date: new Date(new Date().setDate(10)).toISOString(),
    type: 'income'
  },
  {
    id: '5',
    amount: 1200,
    description: 'Abonnement Internet',
    category: 'Factures',
    date: new Date(new Date().setDate(12)).toISOString(),
    type: 'expense'
  }
];