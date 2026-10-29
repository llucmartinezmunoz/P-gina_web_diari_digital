import { Article, Category, Comment } from '../types';

export const LOGO_IMAGE_PATH = '/src/assets/images/petit_pensador_logo_1790339503586.jpg';

export const MANIFESTO_TEXT =
  "Des del cor de la ciutat comtal, amb rebel·lia però amb cap, seny i rauxa, per a tots els lectors amb bon nombre d'anys, l'opinió i la visió dels que tot just comencen a caminar.";

export const CATEGORIES: Category[] = [
  {
    id: 'escrits-personals',
    name: 'Escrits personals',
    description: 'Textos i creacions avantguardistes de collita pròpia.',
  },
  {
    id: 'opinio',
    name: "Articles d'opinió",
    description: 'Visió crítica, tribuna lliure i posicions debatudes.',
  },
  {
    id: 'assajos',
    name: 'Assajos',
    description: "Reflexions de fons, anàlisi d'idees i assaig reposat.",
  },
];

// No preset articles - ready for user's own publications
export const INITIAL_ARTICLES: Article[] = [];

// No preset comments
export const INITIAL_COMMENTS: Comment[] = [];
