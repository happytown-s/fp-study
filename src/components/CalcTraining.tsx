import { useState, useEffect, useRef } from 'react'
import calcData from '../data/calc-training.json'

interface CalcQuestion {
  id: number;
  category: string;
  title: string;
  question: string;
  options: { text: string; correct: boolean }[];
  cheatsheet: string;
  steps: string[];
  explanation: string;
}

interface Props {
  onBack: () => void;
}

const questions = calcData as CalcQuestion[];

const categories = [...new Set(questions.map(q => q.category))];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CalcTraining({ onBack }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [revealedStep, setRevealedStep] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [timer, setTimer] = useState(300);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [shuffled, setShuffled] = useState<CalcQuestion[]>([]);
  const [stats, setStats] = useState<Record<string, { correct: number; total: number }>>({});

  useEffect(() => {
    const saved = localStorage.getItem('fp-calc-stats');
    if (saved) setStats(JSON.parse(saved));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const updateStats = (cat: string, correct: boolean) => {
    setStats(prev => {
      const next = { ...prev };
      if (!next[cat]) next[cat] = { correct: 0, total: 0 };
      next[cat].total++;
      if (correct) next[cat].correct++;
      localStorage.setItem('fp-calc-stats', JSON.stringify(next));
      return next;
    });
  };

  const startPractice = (cat: string) => {
    setSelectedCategory(cat);
    setIsTestMode(false);
    setIsFinished(false);
    setScore(0);
    setTotal(0);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowSteps(false);
    setRevealedStep(0);
    setShuffled(questions.filter(q => q.category === cat));
  };

  const startTest = (cat: string) => {
    setSelectedCategory(cat);
    setIsTestMode(true);
    setIsFinished(false);
    setScore(0);
    setTotal(0);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShuffled(shuffle(questions.filter(q => q.category === cat)).slice(0, 10));
    setTimer(300);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); setIsFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const q = shuffled[currentQ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={selectedCategory ? () => { setSelectedCategory(null); setIsTestMode(false); if (timerRef.current) clearInterval(timerRef.current); } : onBack}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          {selectedCategory ? 'Categories' : 'Back'}
        </button>

        {!selectedCategory ? (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Calc Training</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">FP2 Calculation Drills</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(cat => {
                const catQs = questions.filter(q => q.category === cat);
                const s = stats[cat];
                const pct = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cat}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{catQs.length} questions</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct === 0 ? 'bg-gray-600' : pct < 80 ? 'bg-amber-500' : 'bg-green-500'} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{s && s.total > 0 ? `${pct}%` : '--'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startPractice(cat)} className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:opacity-90">Practice</button>
                      <button onClick={() => startTest(cat)} className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Test</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isFinished ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">{score}/{total}</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{total > 0 ? `${Math.round((score / total) * 100)}% accuracy` : ''}</p>
            <button onClick={() => startPractice(selectedCategory)} className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:opacity-90">Retry</button>
          </div>
        ) : q ? (
          <div className="space-y-4">
            {isTestMode && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Q{currentQ + 1}/{shuffled.length}</span>
                <span className={`font-mono font-bold text-lg ${timer < 30 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>{formatTime(timer)}</span>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
              {!isTestMode && (
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Question {currentQ + 1} / {shuffled.length}</span>
                  <span>Score: {score}</span>
                </div>
              )}
              <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">{q.title}</div>
              <p className="text-gray-900 dark:text-white font-medium mb-4">{q.question}</p>
              <div className="space-y-2 mb-4">
                {q.options.map((opt, idx) => {
                  let cls = 'border-2 rounded-lg p-3 text-left transition-all cursor-pointer ';
                  if (selectedAnswer === null) {
                    cls += 'border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500';
                  } else if (opt.correct) {
                    cls += 'border-green-500 bg-green-50 dark:bg-green-900/20';
                  } else if (selectedAnswer === idx) {
                    cls += 'border-red-500 bg-red-50 dark:bg-red-900/20';
                  } else {
                    cls += 'border-gray-200 dark:border-gray-600 opacity-50';
                  }
                  return (
                    <button key={idx} onClick={() => {
                      if (selectedAnswer !== null) return;
                      setSelectedAnswer(idx);
                      const correct = opt.correct;
                      if (correct) setScore(s => s + 1);
                      setTotal(t => t + 1);
                      updateStats(q.category, correct);
                      if (!correct) setShowSteps(true);
                    }} className={cls}>
                      <span className="text-sm text-gray-900 dark:text-white">{opt.text}</span>
                      {selectedAnswer !== null && opt.correct && <span className="ml-2 text-green-600 font-bold text-xs">Correct</span>}
                      {selectedAnswer === idx && !opt.correct && <span className="ml-2 text-red-600 font-bold text-xs">Wrong</span>}
                    </button>
                  );
                })}
              </div>
              {showSteps && (
                <div className="mb-4">
                  {!isTestMode ? (
                    <div className="space-y-2">
                      {q.steps.map((step, i) => (
                        <div key={i} className="flex gap-2" style={{ display: i < revealedStep ? 'flex' : 'none' }}>
                          <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/40 rounded px-2 py-1 h-fit whitespace-nowrap">Step {i+1}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                        </div>
                      ))}
                      {revealedStep < q.steps.length && (
                        <button onClick={() => setRevealedStep(s => s + 1)} className="text-sm text-orange-500 hover:underline">Show next step</button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1">
                      {q.steps.map((step, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/40 rounded px-2 py-1 h-fit whitespace-nowrap">Step {i+1}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedAnswer !== null && !isTestMode && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 mb-3 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-800 dark:text-indigo-300">{q.explanation}</p>
                </div>
              )}
              {selectedAnswer !== null && (
                <button onClick={() => {
                  if (currentQ + 1 >= shuffled.length) {
                    if (isTestMode) { if (timerRef.current) clearInterval(timerRef.current); }
                    setIsFinished(true);
                  } else {
                    setCurrentQ(c => c + 1);
                    setSelectedAnswer(null);
                    setShowSteps(false);
                    setRevealedStep(0);
                  }
                }} className="w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity">
                  {currentQ + 1 >= shuffled.length ? 'Finish' : 'Next'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center text-gray-500 dark:text-gray-400">
            No questions in this category.
          </div>
        )}
      </div>
    </div>
  );
}
