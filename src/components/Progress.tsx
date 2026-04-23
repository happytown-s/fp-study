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

const categoryNames: Record<string, string> = {
  'Life Planning': 'ライフプランニング',
  'Financial Products': '金融商品',
  'Insurance': '保険',
  'Tax': '税金',
  'Real Estate': '不動産',
  'Inheritance': '相続',
  'Pension & Social Security': '年金・社会保障',
  'Risk Management': 'リスク管理',
  'External Economics': '外部経済',
  'Financial Regulations': '金融法規',
  'Compound Interest': '複利計算',
  'Loan Payments': 'ローン返済',
  'Tax Calculation': '税金計算',
  'Insurance Premium': '保険料計算',
  'Pension Calculation': '年金計算',
  'Asset Allocation': '資産配分',
  'Inheritance Division': '相続分割',
  'Real Estate ROI': '不動産利回り',
};

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
    if (confirm('進捗データを全て消去しますか？元に戻せません。')) {
      localStorage.removeItem('fp-wrongQuestions');
      localStorage.removeItem('fp-answerHistory');
      localStorage.removeItem('fp-activeQuiz');
      setStats(computeStats(questions));
    }
  };

  if (!stats) {
    return <div className="text-text-secondary text-center py-20">進捗を読み込み中...</div>;
  }

  const overallPct = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  const catLabel = (cat: string) => categoryNames[cat] || cat;

  const renderCategoryBar = (cat: string, data: { answered: number; correct: number }) => {
    if (data.answered === 0) return null;
    const pct = Math.round((data.correct / data.answered) * 100);
    return (
      <div key={cat} className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary truncate mr-2">{catLabel(cat)}</span>
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
        <h2 className="text-lg font-bold">全体の進捗</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-accent">{overallPct}%</div>
            <div className="text-text-muted text-xs mt-1">正答率</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">{stats.totalAnswered}</div>
            <div className="text-text-muted text-xs mt-1">解答数</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-text-primary">{stats.streak}</div>
            <div className="text-text-muted text-xs mt-1">連続正解</div>
          </div>
        </div>
        <div className="text-xs text-text-muted text-center">
          最高連続正解: {stats.bestStreak}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-5 space-y-3">
        <h3 className="font-medium">問題集カテゴリ</h3>
        <div className="space-y-3">
          {QUIZ_CATEGORIES.map(cat => renderCategoryBar(cat, stats.byCategory[cat]))}
          {QUIZ_CATEGORIES.every(c => stats.byCategory[c].answered === 0) && (
            <p className="text-text-muted text-sm">問題集データがありません。問題集を始めて進捗を記録しましょう。</p>
          )}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-5 space-y-3">
        <h3 className="font-medium">計算カテゴリ</h3>
        <div className="space-y-3">
          {CALC_CATEGORIES.map(cat => renderCategoryBar(cat, stats.byCalcCategory[cat]))}
          {CALC_CATEGORIES.every(c => stats.byCalcCategory[c].answered === 0) && (
            <p className="text-text-muted text-sm">計算トレーニングデータがありません。</p>
          )}
        </div>
      </div>

      <div className="bg-bg-card rounded-xl p-4 flex items-center justify-center gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-correct" />
          80%以上 (得意)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          60-79% (復習推奨)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-incorrect" />
          60%未満 (要強化)
        </div>
      </div>

      <button
        onClick={clearData}
        className="w-full py-2 text-text-muted hover:text-incorrect text-sm transition-colors"
      >
        全ての進捗データを消去
      </button>
    </div>
  );
}
