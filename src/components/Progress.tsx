import { useState, useEffect } from 'react';
import type { Question } from '../data/types';

const QUIZ_CATEGORIES = [
  'Life Planning',
  'Financial Products',
  'Insurance',
  'Tax',
  'Real Estate',
  'Inheritance',
  'Pension & Social Security',
  'Risk Management',
  'External Economics',
  'Financial Regulations',
];

const CALC_CATEGORIES = [
  'Compound Interest',
  'Loan Payments',
  'Tax Calculation',
  'Insurance Premium',
  'Pension Calculation',
  'Asset Allocation',
  'Inheritance Division',
  'Real Estate ROI',
];

interface AnswerEntry {
  questionIdx: number;
  correct: boolean;
  timestamp: number;
  isCalc: boolean;
  calcCategory?: string;
}

interface Stats {
  totalAnswered: number;
  totalCorrect: number;
  byCategory: Record<string, { answered: number; correct: number }>;
  byCalcCategory: Record<string, { answered: number; correct: number }>;
  streak: number;
  bestStreak: number;
}

function computeStats(questions: Question[]): Stats {
  const history = JSON.parse(localStorage.getItem('fp-answerHistory') || '[]') as AnswerEntry[];

  const stats: Stats = {
    totalAnswered: history.length,
    totalCorrect: history.filter(h => h.correct).length,
    byCategory: {},
    byCalcCategory: {},
    streak: 0,
    bestStreak: 0,
  };

  QUIZ_CATEGORIES.forEach(c => { stats.byCategory[c] = { answered: 0, correct: 0 }; });
  CALC_CATEGORIES.forEach(c => { stats.byCalcCategory[c] = { answered: 0, correct: 0 }; });

  history.forEach(h => {
    if (!h.isCalc && questions[h.questionIdx]) {
      const cat = questions[h.questionIdx].category;
      if (stats.byCategory[cat]) {
        stats.byCategory[cat].answered++;
        if (h.correct) stats.byCategory[cat].correct++;
      }
    }
    if (h.isCalc && h.calcCategory && stats.byCalcCategory[h.calcCategory]) {
      stats.byCalcCategory[h.calcCategory].answered++;
      if (h.correct) stats.byCalcCategory[h.calcCategory].correct++;
    }
  });

  // Current streak (from most recent)
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  let currentStreak = 0;
  for (const h of sorted) {
    if (h.correct) currentStreak++;
    else break;
  }
  stats.streak = currentStreak;

  // Best streak (chronological)
  let tmpStreak = 0;
  const chronological = [...history].sort((a, b) => a.timestamp - b.timestamp);
  for (const h of chronological) {
    if (h.correct) {
      tmpStreak++;
      if (tmpStreak > stats.bestStreak) stats.bestStreak = tmpStreak;
    } else {
      tmpStreak = 0;
    }
  }

  return stats;
}

export default function Progress() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    import('../data/fp-exam.json').then(qMod => {
      const qs = qMod.default as unknown as Question[];
      setQuestions(qs);
      setStats(computeStats(qs));
    });
  }, []);

  const clearData = () => {
    if (confirm('Clear all progress data? This cannot be undone.')) {
      localStorage.removeItem('fp-wrongQuestions');
      localStorage.removeItem('fp-answerHistory');
      localStorage.removeItem('fp-activeQuiz');
      setStats(computeStats(questions));
    }
  };

  if (!stats) {
    return <div className="text-text-secondary text-center py-20">Loading progress...</div>;
  }

  const overallPct = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  const renderCategoryBar = (cat: string, data: { answered: number; correct: number }) => {
    if (data.answered === 0) return null;
    const pct = Math.round((data.correct / data.answered) * 100);
    return (
      <div key={cat} className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary truncate mr-2">{cat}</span>
          <span className="text-text-muted shrink-0">
            {data.correct}/{data.answered} ({pct}%)
          </span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 80 ? 'bg-correct' : pct >= 60 ? 'bg-yellow-500' : 'bg-incorrect'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-card rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">Overall Progress</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-accent">{overallPct}%</div>
            <div className="text-text-muted text-xs mt-1">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">{stats.totalAnswered}</div>
            <div className="text-text-muted text-xs mt-1">Answered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">{stats.streak}</div>
            <div className="text-text-muted text-xs mt-1">Current Streak</div>
          </div>
        </div>
        <div className="text-xs text-text-muted text-center">
          Best streak: {stats.bestStreak}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Quiz Categories</h3>
        <div className="space-y-3">
          {QUIZ_CATEGORIES.map(cat => renderCategoryBar(cat, stats.byCategory[cat]))}
          {QUIZ_CATEGORIES.every(c => stats.byCategory[c].answered === 0) && (
            <p className="text-text-muted text-sm">No quiz data yet. Start a quiz to track progress.</p>
          )}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Calculation Categories</h3>
        <div className="space-y-3">
          {CALC_CATEGORIES.map(cat => renderCategoryBar(cat, stats.byCalcCategory[cat]))}
          {CALC_CATEGORIES.every(c => stats.byCalcCategory[c].answered === 0) && (
            <p className="text-text-muted text-sm">No calc training data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-4 flex items-center justify-center gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-correct" />
          80%+ (Strong)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          60-79% (Review)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-incorrect" />
          Below 60% (Weak)
        </div>
      </div>

      <button
        onClick={clearData}
        className="w-full py-2 text-text-muted hover:text-incorrect text-sm transition-colors"
      >
        Clear All Progress Data
      </button>
    </div>
  );
}
