import type { Question, Answer } from './types';

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePitchQuestion(level: number): Question {
  const diff = 6 - Math.min(level, 5);
  let aFreq: number, bFreq: number;
  do {
    const base = 440 + rand(-1, 1) * rand(0, diff);
    aFreq = base;
    bFreq = base + rand(-1, 1) * diff;
  } while (!(aFreq >= 435 && aFreq <= 445 && bFreq >= 435 && bFreq <= 445));

  let correctAnswer: Answer;
  if (aFreq > bFreq) correctAnswer = 'A';
  else if (bFreq > aFreq) correctAnswer = 'B';
  else correctAnswer = 'same';

  return { type: 'pitch', aFreq, bFreq, aGain: 0, bGain: 0, correctAnswer, level };
}

export function generateDecibelQuestion(level: number): Question {
  const diff = 6 - Math.min(level, 5);
  const baseFreq = 440;
  let aGain: number, bGain: number;
  do {
    aGain = 5 + rand(-1, 1) * rand(0, diff);
    bGain = aGain + rand(-1, 1) * diff;
  } while (!(aGain >= 0 && aGain <= 10 && bGain >= 0 && bGain <= 10));

  let correctAnswer: Answer;
  if (aGain > bGain) correctAnswer = 'A';
  else if (bGain > aGain) correctAnswer = 'B';
  else correctAnswer = 'same';

  return { type: 'decibel', aFreq: baseFreq, bFreq: baseFreq, aGain, bGain, correctAnswer, level };
}

export function generateEndlessQuestion(_streak: number): Question {
  const level = 5;
  const type = Math.random() < 0.5 ? 'pitch' : 'decibel';
  return type === 'pitch' ? generatePitchQuestion(level) : generateDecibelQuestion(level);
}

export function checkAnswer(q: Question, answer: Answer): boolean {
  return q.correctAnswer === answer;
}
