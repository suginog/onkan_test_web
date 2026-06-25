import { useState, useCallback } from 'react';
import type { QuestionType, Answer } from '../types';
import { generatePitchQuestion, generateDecibelQuestion, checkAnswer } from '../question';
import { playTone } from '../audio';

const PITCH_COLORS = ['#6C63FF','#48CAE4','#06D6A0','#FFD166','#EF476F'];
const DECIBEL_COLORS = ['#FF6B9D','#FFB347','#FF6B6B','#A855F7','#06D6A0'];

const MAX = 10;

interface Props {
  type: QuestionType;
  level: number;
  onBack: () => void;
}

export default function TestPage({ type, level, onBack }: Props) {
  const color = (type === 'pitch' ? PITCH_COLORS : DECIBEL_COLORS)[level - 1];
  const gen = useCallback(() =>
    type === 'pitch' ? generatePitchQuestion(level) : generateDecibelQuestion(level),
    [type, level]);

  const [q, setQ] = useState(gen);
  const [answerCount, setAnswerCount] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);

  const playA = () => {
    if (type === 'pitch') playTone(q.aFreq, 0);
    else playTone(440, q.aGain - 5);
  };
  const playB = () => {
    if (type === 'pitch') playTone(q.bFreq, 0);
    else playTone(440, q.bGain - 5);
  };

  const judge = async (answer: Answer) => {
    if (disabled) return;
    setDisabled(true);
    const correct = checkAnswer(q, answer);
    setResult(correct ? 'correct' : 'wrong');
    const newCorrect = correctCount + (correct ? 1 : 0);

    await new Promise(r => setTimeout(r, 900));
    setResult(null);

    if (answerCount >= MAX) {
      if (newCorrect === MAX) {
        const key = type === 'pitch' ? 'pitch_cleared' : 'decibel_cleared';
        const cur = Number(localStorage.getItem(key) ?? 0);
        if (level > cur) localStorage.setItem(key, String(level));
      }
      setFinalCorrect(newCorrect);
      setShowDialog(true);
      setDisabled(false);
      return;
    }

    setCorrectCount(newCorrect);
    setAnswerCount(n => n + 1);
    setQ(gen());
    setDisabled(false);
  };

  const pitchBtns: { label: string; answer: Answer; color: string }[] = [
    { label: 'A の方が高い', answer: 'A',    color: '#6C63FF' },
    { label: 'B の方が高い', answer: 'B',    color: '#48CAE4' },
    { label: 'どちらも同じ', answer: 'same', color: '#FFD166' },
  ];
  const decibelBtns: { label: string; answer: Answer; color: string }[] = [
    { label: 'A の方が大きい', answer: 'A',    color: '#FF6B9D' },
    { label: 'B の方が大きい', answer: 'B',    color: '#FFB347' },
    { label: 'どちらも同じ',   answer: 'same', color: '#A855F7' },
  ];
  const btns = type === 'pitch' ? pitchBtns : decibelBtns;

  return (
    <div className="test-page">
      <div className="test-header" style={{ background: `${color}22` }}>
        <div className="test-header-row">
          <button className="back-btn" style={{ position: 'static', background: `${color}33`, color }} onClick={onBack}>‹</button>
          <span className="test-title" style={{ color }}>{type === 'pitch' ? '周波数テスト' : '音量テスト'} Level {level}</span>
        </div>
      </div>

      <div className="progress-wrap" style={{ marginTop: 12 }}>
        <div className="progress-label">{answerCount} / {MAX} 問目</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(answerCount - 1) / MAX * 100}%`, background: color }} />
        </div>
      </div>

      <div className="play-area">
        <button className="play-btn" style={{ background: `linear-gradient(135deg,#6C63FF,#9B8FFF)` }} onClick={playA}>
          <span className="play-icon">▶</span>A
        </button>
        <button className="play-btn" style={{ background: `linear-gradient(135deg,#48CAE4,#00B4D8)` }} onClick={playB}>
          <span className="play-icon">▶</span>B
        </button>
      </div>

      <p className="question-text">{type === 'pitch' ? '周波数が高いのはどちら？' : '音が大きいのはどちら？'}</p>
      <p className="question-sub">A・B を聴いてから答えよう</p>

      <div className="answer-area">
        {btns.map(b => (
          <button key={b.answer} className="answer-btn" style={{ background: b.color }} disabled={disabled} onClick={() => judge(b.answer)}>
            {b.label}
          </button>
        ))}
      </div>

      {result && (
        <div className="result-overlay">
          <span className="result-mark" style={{ color: result === 'correct' ? '#06D6A0cc' : '#EF476Fcc' }}>
            {result === 'correct' ? '◯' : '✕'}
          </span>
        </div>
      )}

      {showDialog && (
        <div className="dialog-bg">
          <div className="dialog">
            <div className="dialog-emoji">{finalCorrect === MAX ? '🎉' : '🎵'}</div>
            <div className="dialog-title" style={{ color }}>{finalCorrect === MAX ? 'パーフェクト！' : '結果発表'}</div>
            <div className="dialog-score" style={{ background: `linear-gradient(135deg,${color},${color}aa)` }}>
              {MAX}問中 {finalCorrect}問 正解
            </div>
            <button className="dialog-btn" onClick={onBack}>もどる</button>
          </div>
        </div>
      )}
    </div>
  );
}
