export type Mode = 'home' | 'pitch' | 'decibel' | 'endless';
export type QuestionType = 'pitch' | 'decibel';
export type Answer = 'A' | 'B' | 'same';

export interface Question {
  type: QuestionType;
  aFreq: number;
  bFreq: number;
  aGain: number;
  bGain: number;
  correctAnswer: Answer;
  level: number;
}
