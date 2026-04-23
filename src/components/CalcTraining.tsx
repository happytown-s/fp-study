import { useState, useEffect } from 'react';
import type { CalcQuestion } from '../data/types';

const CALC_CATEGORIES = [
  'Compound Interest',
  'Loan Payments',
  'Tax Calculation',
  'Insurance Premium',
  'Pension Calculation',
  'Asset Allocation',
  'Inheritance Division',
  'Real Estate ROI',
] as const;

const categoryNames: Record<string, string> = {
  'Compound Interest': '複利計算',
  'Loan Payments': 'ローン返済',
  'Tax Calculation': '税金計算',
  'Insurance Premium': '保険料計算',
  'Pension Calculation': '年金計算',
  'Asset Allocation': '資産配分',
  'Inheritance Division': '相続分割',
  'Real Estate ROI': '不動産利回り',
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CalcTraining() {
  const [questions, setQuestions] = useState<CalcQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<CalcQuestion[]>([]);

  useEffect(() => {
    import('../data/calc-training.json').then(m => setQuestions(m.default as unknown as CalcQuestion[]));
  }, []);

  const startPractice = (category: string | null) => {
    const pool = category
      ? questions.filter((q: CalcQuestion) => q.category === category)
      : [...questions];
    if (pool.length === 0) return;
    setActiveQuestions(shuffleArray(pool));
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowSolution(false);
    setStarted(true);
  };

  const handleAnswer = (optIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);
    setShowSolution(true);

    // Save to history
    const q = activeQuestions[currentIdx];
    const history = JSON.parse(localStorage.getItem('fp-answerHistory') || '[]');
    history.push({
      questionIdx: q.id,
      correct: q.options[optIdx].correct,
      timestamp: Date.now(),
      isCalc: true,
      calcCategory: q.category,
    });
    localStorage.setItem('fp-answerHistory', JSON.stringify(history));
  };

  const next = () => {
    if (currentIdx + 1 >= activeQuestions.length) {
      setStarted(false);
      return;
    }
    setCurrentIdx(prev => prev + 1);
    setSelectedOption(null);
    setShowSolution(false);
  };

  const back = () => {
    setStarted(false);
    setActiveQuestions([]);
  };

  const catLabel = (cat: string) => categoryNames[cat] || cat;

  if (questions.length === 0) {
    return (
      <div className="text-text-secondary text-center py-20">計算問題を読み込み中...</div>
    );
  }

  if (started && activeQuestions.length > 0) {
    const q = activeQuestions[currentIdx];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={back} className="text-text-secondary hover:text-text-primary text-sm">
            戻る
          </button>
          <span className="text-text-secondary text-sm">
            {currentIdx + 1} / {activeQuestions.length}
          </span>
        </div>

        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        <div className="bg-bg-card rounded-xl p-5 space-y-3">
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
            {catLabel(q.category)}
          </span>
          <h2 className="text-lg font-medium">{q.title}</h2>
          <p className="text-text-secondary leading-relaxed">{q.question}</p>
        </div>

        {showSolution && (
          <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
            <p className="font-medium text-accent text-sm">公式 / チートシート</p>
            <pre className="text-text-secondary text-sm whitespace-pre-wrap font-mono">
              {q.cheatsheet}
            </pre>
          </div>
        )}

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let btnClass = 'bg-bg-card hover:bg-bg-tertiary border-border';
            if (selectedOption !== null) {
              if (opt.correct) {
                btnClass = 'bg-correct/15 border-correct text-correct';
              } else if (i === selectedOption && !opt.correct) {
                btnClass = 'bg-incorrect/15 border-incorrect text-incorrect';
              } else {
                btnClass = 'bg-bg-card border-border opacity-50';
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedOption !== null}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${btnClass}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-text-muted text-sm mt-0.5 shrink-0">{String.fromCharCode(65 + i)}</span>
                  <span className="text-sm">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showSolution && (
          <div className="bg-bg-tertiary rounded-lg p-4 space-y-2">
            <p className="font-medium text-accent text-sm">ステップバイステップ解法</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary">
              {q.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {showSolution && q.explanation && (
          <div className="bg-bg-tertiary rounded-lg p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">ポイント</p>
            {q.explanation}
          </div>
        )}

        {selectedOption !== null && (
          <button
            onClick={next}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            {currentIdx + 1 >= activeQuestions.length ? '終了' : '次の問題'}
          </button>
        )}
      </div>
    );
  }

  const catCount = (cat: string) => questions.filter((q: CalcQuestion) => q.category === cat).length;

  return (
    <div className="space-y-6">
      <div className="bg-bg-card rounded-xl p-5">
        <h2 className="text-lg font-bold mb-1">計算トレーニング</h2>
        <p className="text-text-secondary text-sm">
          公式とステップバイステップ解法で計算練習
        </p>
      </div>

      <button
        onClick={() => startPractice(null)}
        className="w-full bg-accent hover:bg-accent-hover text-white rounded-xl p-4 font-medium transition-colors"
      >
        全問題 ({questions.length})
      </button>

      <div className="grid gap-3">
        {CALC_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => startPractice(cat)}
            className="bg-bg-card hover:bg-bg-tertiary p-4 rounded-xl text-left border border-border transition-colors"
          >
            <div className="font-medium text-accent">{catLabel(cat)}</div>
            <div className="text-text-muted text-xs mt-1">{catCount(cat)} 問</div>
          </button>
        ))}
      </div>
    </div>
  );
}
