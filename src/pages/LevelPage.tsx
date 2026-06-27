import { useEffect, useState } from 'react';
import type { QuestionType } from '../types';
import { playSE, stopBGM } from '../audio';

const PITCH_COLORS = ['#6C63FF', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F'];
const DECIBEL_COLORS = ['#FF6B9D', '#FFB347', '#FF6B6B', '#A855F7', '#06D6A0'];

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

  useEffect(() => {
    setCleared(Number(localStorage.getItem(key) ?? 0));
  }, [key]);

  const handleLevel = (l: number) => {
    playSE('button');
    stopBGM();
    onStart(l);
    onGoTest();
  };

  return (
    <div className="level-page">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon">🎵</div>
            音感トレーニング
          </div>
          <button className="navbar-back" onClick={onBack}>← ホームに戻る</button>
        </div>
      </nav>

      <div className="level-hero">
        <div className={`level-icon ${type === 'pitch' ? 'pitch-bg' : 'decibel-bg'}`}>
          {type === 'pitch' ? '🎼' : '🔊'}
        </div>
        <h1>{type === 'pitch' ? '周波数テスト' : '音量テスト'}</h1>
        <p>{type === 'pitch' ? '2つの音、どちらが高い？' : '2つの音、どちらが大きい？'}</p>
      </div>

      <div className="level-list">
        {[1, 2, 3, 4, 5].filter(l => l <= cleared + 1).map(l => (
          <button
            key={l}
            className="level-btn"
            style={{ borderColor: `${colors[l - 1]}33` }}
            onClick={() => handleLevel(l)}
          >
            <span className="star" style={{ color: l <= cleared ? colors[l - 1] : '#444' }}>
              {l <= cleared ? '★' : '☆'}
            </span>
            <span className="label">Level {l}</span>
            {l <= cleared && (
              <span className="badge" style={{ background: `${colors[l - 1]}22`, color: colors[l - 1] }}>
                CLEAR
              </span>
            )}
            <span style={{ color: '#444' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
