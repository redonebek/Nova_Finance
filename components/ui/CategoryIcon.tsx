import React from 'react';
import {
  Wallet, Briefcase, TrendingUp, Gift, Home, Utensils,
  Car, Clapperboard, HeartPulse, ShoppingBag, Receipt,
  MoreHorizontal, Tag, LucideIcon, Smartphone, Coffee,
  Plane, Music, Book, Zap, Shield, GraduationCap
} from 'lucide-react';

// Mapping des mots-clés (en minuscule) vers les icônes Lucide
const ICON_MAP: Record<string, LucideIcon> = {
  // Revenus
  'salaire': Wallet,
  'freelance': Briefcase,
  'investissements': TrendingUp,
  'cadeaux': Gift,
  
  // Dépenses
  'logement': Home,
  'loyer': Home,
  'maison': Home,
  'alimentation': Utensils,
  'restaurant': Utensils,
  'courses': Utensils,
  'transport': Car,
  'voiture': Car,
  'essence': Car,
  'divertissement': Clapperboard,
  'loisirs': Clapperboard,
  'santé': HeartPulse,
  'médecin': HeartPulse,
  'pharmacie': HeartPulse,
  'shopping': ShoppingBag,
  'vêtements': ShoppingBag,
  'factures': Receipt,
  'électricité': Zap,
  'eau': Zap,
  'internet': Zap,
  'assurance': Shield,
  'éducation': GraduationCap,
  'formation': GraduationCap,
  'voyage': Plane,
  'vacances': Plane,
  'café': Coffee,
  'tech': Smartphone,
  'musique': Music,
  'livres': Book,

  // Fallback
  'autre': MoreHorizontal,
  'divers': MoreHorizontal
};

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = '', size = 16 }) => {
  // Recherche insensible à la casse
  const key = category.toLowerCase();
  
  // Si correspondance directe
  let Icon = ICON_MAP[key];

  // Si pas de correspondance exacte, on essaie de trouver un mot clé contenu dans la catégorie
  if (!Icon) {
    const foundKey = Object.keys(ICON_MAP).find(k => key.includes(k));
    if (foundKey) {
      Icon = ICON_MAP[foundKey];
    }
  }

  // Icône par défaut
  const FinalIcon = Icon || Tag;

  return <FinalIcon size={size} className={className} />;
};