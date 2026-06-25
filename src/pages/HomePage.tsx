import type { Mode } from '../types';
import { resume } from '../audio';

interface Props {
  onSelect: (mode: Mode, level?: number) => void;
}

export default function HomePage({ onSelect }: Props) {
  const handle = (m: Mode) => { resume(); onSelect(m); };
  return (
    <div className="home">
      <div className="home-logo">🎵</div>
      <h1>音感トレーニング</h1>
      <p>耳を鍛えよう！</p>
      <div className="menu">
        <button className="menu-card card-pitch" onClick={() => handle('pitch')}>
          <span className="icon">🎼</span>
          <div className="text">
            <h2>周波数テスト</h2>
            <p>どちらの音が高い？</p>
          </div>
          <span className="arrow">›</span>
        </button>
        <button className="menu-card card-decibel" onClick={() => handle('decibel')}>
          <span className="icon">🔊</span>
          <div className="text">
            <h2>音量テスト</h2>
            <p>どちらの音が大きい？</p>
          </div>
          <span className="arrow">›</span>
        </button>
        <button className="menu-card card-endless" onClick={() => handle('endless')}>
          <span className="icon">♾️</span>
          <div className="text">
            <h2>エンドレスモード</h2>
            <p>ミスするまで連続挑戦！</p>
          </div>
          <span className="arrow">›</span>
        </button>
      </div>
    </div>
  );
}
