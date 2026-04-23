import { useState, useEffect } from 'react';
import Quiz from './components/Quiz';
import CalcTraining from './components/CalcTraining';
import Progress from './components/Progress';

type Tab = 'quiz' | 'calc' | 'progress';

function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('fp-activeTab');
    return (saved === 'quiz' || saved === 'calc' || saved === 'progress') ? saved : 'quiz';
  });

  useEffect(() => {
    localStorage.setItem('fp-activeTab', tab);
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'quiz', label: '問題集' },
    { key: 'calc', label: '計算トレーニング' },
    { key: 'progress', label: '進捗' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-xl font-bold text-accent pt-4 pb-1">
            FP Study
          </h1>
          <p className="text-text-secondary text-sm mb-3">
            ファイナンシャルプランナー3級 試験対策
          </p>
          <nav className="flex gap-1 -mb-px">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'quiz' && <Quiz />}
        {tab === 'calc' && <CalcTraining />}
        {tab === 'progress' && <Progress />}
      </main>
    </div>
  );
}

export default App;
