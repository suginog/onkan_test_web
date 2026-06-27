import { useState, useCallback, useEffect } from 'react';
import type { QuestionType, Answer } from '../types';
import { generatePitchQuestion, generateDecibelQuestion, checkAnswer } from '../question';
import { playTone, playSE, stopBGM } from '../audio';

const PITCH_COLORS = ['#6C63FF', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F'];
const DECIBEL_COLORS = ['#FF6B9D', '#FFB347', '#FF6B6B', '#A855F7', '#06D6A0'];

const MAX = 10;

interface Props {
  type: QuestionType;
  level: number;
  onBack: () => void;
}

export default function TestPage({ type, level, onBack }: Props) {
  useEffect(() => { stopBGM(); }, []);
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
    playSE(correct ? 'pinpon' : 'batsu');
    const newCorrect = correctCount + (correct ? 1 : 0);

    await new Promise(r => setTimeout(r, 900));
    setResult(null);

    if (answerCount >= MAX) {
      if (newCorrect === MAX) {
        const key = type === 'pitch' ? 'pitch_cleared' : 'decibel_cleared';
        const cur = Number(localStorage.getItem(key) ?? 0);
        if (level > cur) localStorage.setItem(key, String(level));
      }
      playSE(newCorrect === MAX ? 'clear' : 'fail');
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

  const pitchBtns: { label: string; answer: Answer; bg: string }[] = [
    { label: 'A の方が高い', answer: 'A',    bg: `${PITCH_COLORS[0]}22` },
    { label: 'B の方が高い', answer: 'B',    bg: `${PITCH_COLORS[1]}22` },
    { label: 'どちらも同じ', answer: 'same', bg: `${PITCH_COLORS[3]}22` },
  ];
  const decibelBtns: { label: string; answer: Answer; bg: string }[] = [
    { label: 'A の方が大きい', answer: 'A',    bg: `${DECIBEL_COLORS[0]}22` },
    { label: 'B の方が大きい', answer: 'B',    bg: `${DECIBEL_COLORS[1]}22` },
    { label: 'どちらも同じ',   answer: 'same', bg: `${DECIBEL_COLORS[3]}22` },
  ];
  const btns = type === 'pitch' ? pitchBtns : decibelBtns;
  const borderColors = type === 'pitch'
    ? [PITCH_COLORS[0], PITCH_COLORS[1], PITCH_COLORS[3]]
    : [DECIBEL_COLORS[0], DECIBEL_COLORS[1], DECIBEL_COLORS[3]];

  return (
    <div className="test-page">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon" style={{ background: `${color}33` }}>
              {type === 'pitch' ? '🎼' : '🔊'}
            </div>
            <span style={{ color }}>{type === 'pitch' ? '周波数' : '音量'}テスト Level {level}</span>
          </div>
          <button className="navbar-back" onClick={onBack}>← 戻る</button>
        </div>
      </nav>

      <div className="progress-wrap">
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
        {btns.map((b, i) => (
          <button
            key={b.answer}
            className="answer-btn"
            style={{ background: b.bg, borderColor: `${borderColors[i]}44` }}
            disabled={disabled}
            onClick={() => judge(b.answer)}
          >
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
            <br />
            <button className="dialog-btn" onClick={onBack}>もどる</button>
          </div>
        </div>
      )}
    </div>
  );
}
