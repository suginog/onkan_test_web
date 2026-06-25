import { useEffect, useState } from 'react';
import type { QuestionType } from '../types';

const PITCH_COLORS = [
  'linear-gradient(135deg,#6C63FF,#9B8FFF)',
  'linear-gradient(135deg,#48CAE4,#00B4D8)',
  'linear-gradient(135deg,#06D6A0,#1B9AAA)',
  'linear-gradient(135deg,#FFD166,#EF8C33)',
  'linear-gradient(135deg,#EF476F,#B5179E)',
];
const DECIBEL_COLORS = [
  'linear-gradient(135deg,#FF6B9D,#FF8EC1)',
  'linear-gradient(135deg,#FFB347,#FF8C00)',
  'linear-gradient(135deg,#FF6B6B,#FF4757)',
  'linear-gradient(135deg,#A855F7,#7C3AED)',
  'linear-gradient(135deg,#06D6A0,#059669)',
];

interface Props {
  type: QuestionType;
  level: number;
  onBack: () => void;
  onStart: (level: number) => void;
  onGoTest: () => void;
}

export default function LevelPage({ type, onBack, onStart, onGoTest }: Props) {
  const [cleared, setCleared] = useState(0);
  const key = type === 'pitch' ? 'pitch_cleared' : 'decibel_cleared';
  const colors = type === 'pitch' ? PITCH_COLORS : DECIBEL_COLORS;
  const headerGrad = type === 'pitch'
    ? 'linear-gradient(135deg,#6C63FF,#48CAE4)'
    : 'linear-gradient(135deg,#FF6B9D,#FFB347)';

  useEffect(() => {
    setCleared(Number(localStorage.getItem(key) ?? 0));
  }, [key]);

  const handleLevel = (l: number) => {
    onStart(l);
    onGoTest();
  };

  return (
    <div className="level-page" style={{ position: 'relative' }}>
      <div className="level-header" style={{ background: headerGrad }}>
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="icon">{type === 'pitch' ? '🎼' : '🔊'}</div>
        <h1>{type === 'pitch' ? '周波数テスト' : '音量テスト'}</h1>
        <p>{type === 'pitch' ? '2つの音、どちらが高い？' : '2つの音、どちらが大きい？'}</p>
      </div>
      <div className="level-list">
        {[1, 2, 3, 4, 5].filter(l => l <= cleared + 1).map(l => (
          <button
            key={l}
            className="level-btn"
            style={{ background: colors[l - 1] }}
            onClick={() => handleLevel(l)}
          >
            <span className="star">{l <= cleared ? '★' : '☆'}</span>
            <span className="label">Level {l}</span>
            {l <= cleared && <span className="badge">クリア済み</span>}
            <span>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
