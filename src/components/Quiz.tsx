import { useState, useEffect, useCallback } from 'react';
import type { Question } from '../data/types';

const CATEGORIES = [
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
] as const;

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
};

type Mode = 'drill' | 'exam' | 'review';

interface AnswerRecord {
  questionIdx: number;
  selected: number;
  correct: boolean;
  timestamp: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<AnswerRecord[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());
  const [activeQuestionIds, setActiveQuestionIds] = useState<number[]>([]);

  useEffect(() => {
    import('../data/fp-exam.json').then(m => setQuestions(m.default as unknown as Question[]));
    const saved = localStorage.getItem('fp-wrongQuestions');
    if (saved) setWrongQuestions(new Set(JSON.parse(saved)));
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedCategories.size === CATEGORIES.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(CATEGORIES));
    }
  }, [selectedCategories]);

  const startQuiz = useCallback((quizMode: Mode) => {
    let pool: Question[] = [];
    if (quizMode === 'review') {
      pool = questions.filter((_: Question, i: number) => wrongQuestions.has(i));
    } else if (selectedCategories.size > 0) {
      pool = questions.filter((q: Question) => selectedCategories.has(q.category));
    } else {
      pool = [...questions];
    }

    if (pool.length === 0) return;

    const shuffled = quizMode === 'exam'
      ? shuffleArray(pool).slice(0, 50)
      : shuffleArray(pool);

    setMode(quizMode);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setResults([]);
    setShowResults(false);
    const ids = shuffled.map(q => questions.indexOf(q));
    setActiveQuestionIds(ids);
    localStorage.setItem('fp-activeQuiz', JSON.stringify(ids));
  }, [questions, selectedCategories, wrongQuestions]);

  const currentQuestionIdx = mode ? activeQuestionIds[currentIdx] ?? 0 : 0;
  const currentQuestion = mode ? questions[currentQuestionIdx] : null;
  const totalCount = mode === 'exam'
    ? Math.min(50, activeQuestionIds.length)
    : activeQuestionIds.length;

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);

    const correct = currentQuestion.options[optionIdx].correct;
    const newResult: AnswerRecord = {
      questionIdx: currentQuestionIdx,
      selected: optionIdx,
      correct,
      timestamp: Date.now(),
    };
    setResults(prev => [...prev, newResult]);

    // Save to history
    const history = JSON.parse(localStorage.getItem('fp-answerHistory') || '[]');
    history.push({
      questionIdx: currentQuestionIdx,
      correct,
      timestamp: Date.now(),
      isCalc: false,
    });
    localStorage.setItem('fp-answerHistory', JSON.stringify(history));

    if (!correct) {
      setWrongQuestions(prev => {
        const next = new Set(prev);
        next.add(currentQuestionIdx);
        localStorage.setItem('fp-wrongQuestions', JSON.stringify([...next]));
        return next;
      });
    } else {
      setWrongQuestions(prev => {
        const next = new Set(prev);
        next.delete(currentQuestionIdx);
        localStorage.setItem('fp-wrongQuestions', JSON.stringify([...next]));
        return next;
      });
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= totalCount) {
      setShowResults(true);
      return;
    }
    setCurrentIdx(prev => prev + 1);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const exitQuiz = () => {
    setMode(null);
    setShowResults(false);
    setActiveQuestionIds([]);
    localStorage.removeItem('fp-activeQuiz');
  };

  const getCategoryCount = (cat: string) =>
    questions.filter((q: Question) => q.category === cat).length;

  const catLabel = (cat: string) => categoryNames[cat] || cat;

  if (questions.length === 0) {
    return (
      <div className="text-text-secondary text-center py-20">問題を読み込み中...</div>
    );
  }

  // Results screen
  if (showResults && mode) {
    const total = results.length;
    const correctCount = results.filter(r => r.correct).length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="bg-bg-card rounded-xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">問題集完了</h2>
          <div className="text-5xl font-bold text-accent mb-2">{pct}%</div>
          <p className="text-text-secondary">
            {correctCount} / {total} 正解
          </p>
          {pct >= 80 && <p className="text-correct mt-2 font-medium">素晴らしい!</p>}
          {pct >= 60 && pct < 80 && <p className="text-yellow-500 mt-2 font-medium">良い調子! 続けて練習しましょう。</p>}
          {pct < 60 && <p className="text-incorrect mt-2 font-medium">もう少し勉強が必要です。不正解の復習をしましょう。</p>}
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-text-primary">不正解の問題</h3>
          {results
            .filter(r => !r.correct)
            .map((r, i) => {
              const q = questions[r.questionIdx];
              if (!q) return null;
              const correctOpt = q.options.find(o => o.correct);
              return (
                <details key={i} className="bg-bg-card rounded-lg p-4">
                  <summary className="cursor-pointer text-sm font-medium text-incorrect">
                    {q.question.slice(0, 80)}...
                  </summary>
                  <div className="mt-2 text-sm text-text-secondary space-y-1">
                    <p className="text-incorrect">あなたの回答: {q.options[r.selected].text}</p>
                    <p className="text-correct">
                      正解: {correctOpt ? correctOpt.text : 'N/A'}
                    </p>
                    <p className="text-text-muted mt-1">{q.explanation}</p>
                  </div>
                </details>
              );
            })}
          {results.filter(r => !r.correct).length === 0 && (
            <p className="text-text-secondary text-sm">全問正解!</p>
          )}
        </div>

        <button
          onClick={exitQuiz}
          className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          設定に戻る
        </button>
      </div>
    );
  }

  // Active quiz
  if (mode && currentQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={exitQuiz} className="text-text-secondary hover:text-text-primary text-sm">
            終了
          </button>
          <span className="text-text-secondary text-sm">
            {currentIdx + 1} / {totalCount}
          </span>
        </div>

        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalCount) * 100}%` }}
          />
        </div>

        <div className="bg-bg-card rounded-xl p-5 space-y-4">
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
            {catLabel(currentQuestion.category)}
          </span>
          <h2 className="text-lg font-medium leading-relaxed">{currentQuestion.question}</h2>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, i) => {
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

        {showExplanation && (
          <div className="bg-bg-tertiary rounded-lg p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">解説</p>
            {currentQuestion.explanation}
          </div>
        )}

        {selectedOption !== null && (
          <button
            onClick={nextQuestion}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            {currentIdx + 1 >= totalCount ? '結果を見る' : '次の問題'}
          </button>
        )}
      </div>
    );
  }

  // Setup screen
  const poolSize = selectedCategories.size > 0
    ? questions.filter((q: Question) => selectedCategories.has(q.category)).length
    : questions.length;

  return (
    <div className="space-y-6">
      <div className="bg-bg-card rounded-xl p-5">
        <h2 className="text-lg font-bold mb-1">問題集設定</h2>
        <p className="text-text-secondary text-sm">
          カテゴリとモードを選択してください。{questions.length} 問あります。
        </p>
      </div>

      <div className="bg-bg-card rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">カテゴリ</h3>
          <button
            onClick={selectAll}
            className="text-accent text-sm hover:underline"
          >
            {selectedCategories.size === CATEGORIES.length ? '全て解除' : '全て選択'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCategories.has(cat)
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-bg-tertiary border-border text-text-secondary hover:border-text-muted'
              }`}
            >
              {catLabel(cat)} ({getCategoryCount(cat)})
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <button
          onClick={() => startQuiz('drill')}
          className="bg-bg-card hover:bg-bg-tertiary p-4 rounded-xl text-left border border-border transition-colors"
        >
          <div className="font-medium text-accent">ドリルモード</div>
          <div className="text-text-secondary text-sm mt-1">
            全問題をランダムに練習。時間制限なし。
          </div>
          <div className="text-text-muted text-xs mt-1">{poolSize} 問</div>
        </button>

        <button
          onClick={() => startQuiz('exam')}
          className="bg-bg-card hover:bg-bg-tertiary p-4 rounded-xl text-left border border-border transition-colors"
        >
          <div className="font-medium text-accent">模擬試験</div>
          <div className="text-text-secondary text-sm mt-1">
            ランダム50問。本番形式をシミュレート。
          </div>
          <div className="text-text-muted text-xs mt-1">
            {Math.min(50, poolSize)} 問を選択
          </div>
        </button>

        <button
          onClick={() => startQuiz('review')}
          className="bg-bg-card hover:bg-bg-tertiary p-4 rounded-xl text-left border border-border transition-colors"
          disabled={wrongQuestions.size === 0}
        >
          <div className="font-medium text-incorrect">不正解の復習</div>
          <div className="text-text-secondary text-sm mt-1">
            過去に間違えた問題を練習。
          </div>
          <div className="text-text-muted text-xs mt-1">
            {wrongQuestions.size} 問を復習
          </div>
        </button>
      </div>
    </div>
  );
}
