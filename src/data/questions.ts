import type { Question } from '../core/types';
import { quizConfig } from './config';
import rawQuestions from './questions.json';

// Add categoryLabel and ensure all fields are present
const allQuestions: Question[] = rawQuestions.map((q, i) => ({
  id: q.id ?? (i + 1),
  category: q.category,
  categoryLabel: q.categoryLabel ?? q.category,
  question: q.question,
  options: q.options,
  explanation: q.explanation ?? '',
}));

export { allQuestions };

export const categories = quizConfig.categories.map((cat) => ({
  id: cat.id,
  label: cat.label,
  icon: cat.icon,
}));

export { quizConfig };
