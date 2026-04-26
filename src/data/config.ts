import type { QuizConfig } from '../core/types';

export const quizConfig: QuizConfig = {
  id: 'fp-exam',
  title: 'FP',
  description: 'ファイナンシャル・プランニング 問題集',
  passLine: 60,
  examQuestions: 60,
  examTimeLimit: 120,
  categories: [
    { id: 'life-planning', name: 'ライフプランニング', label: 'ライフプランニング', icon: '🏠', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'life-planning')) },    { id: 'products', name: '金融商品', label: '金融商品', icon: '💳', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'products')) },    { id: 'tax', name: '税金', label: '税金', icon: '🧾', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'tax')) },    { id: 'pension', name: '年金・社会保険', label: '年金・社会保険', icon: '📋', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'pension')) },    { id: 'insurance', name: '保険', label: '保険', icon: '🛡️', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'insurance')) },    { id: 'real-estate', name: '不動産', label: '不動産', icon: '🏡', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'real-estate')) },    { id: 'inheritance', name: '相続', label: '相続', icon: '📄', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'inheritance')) },    { id: 'risk', name: 'リスク管理', label: 'リスク管理', icon: '⚠️', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'risk')) },    { id: 'regulations', name: '金融規制', label: '金融規制', icon: '⚖️', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'regulations')) },    { id: 'economics', name: '外部経済', label: '外部経済', icon: '🌍', file: () => import('./questions').then(m => m.allQuestions.filter(q => q.category === 'economics')) }
  ],
  termsFile: () => import('./terms').then(m => m.terms),
};
