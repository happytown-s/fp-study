export interface Question {
  category: string;
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

export interface CalcQuestion {
  id: number;
  category: string;
  title: string;
  question: string;
  options: { text: string; correct: boolean }[];
  cheatsheet: string;
  steps: string[];
  explanation: string;
}
