import type { Mode } from '../types';
import { resume } from '../audio';

interface Props {
  onSelect: (mode: Mode, level?: number) => void;
}

export default function HomePage({ onSelect }: Props) {
  const handle = (m: Mode) => { resume(); onSelect(m); };
  return (
    <div className="home">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon">🎵</div>
            音感トレーニング
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-badge">🎧 Web Audio API で動作</div>
        <h1>音感トレーニング</h1>
        <p>音の高低・音量の違いを聴き分ける<br />耳のトレーニングアプリ</p>
      </div>

      <div className="menu-grid">
        <button className="menu-card card-pitch" onClick={() => handle('pitch')}>
          <div className="icon">🎼</div>
          <div className="text">
            <h2>周波数テスト</h2>
            <p>2つの音を聴き比べて、どちらの周波数が高いか当てよう</p>
          </div>
          <span className="arrow">›</span>
        </button>
        <button className="menu-card card-decibel" onClick={() => handle('decibel')}>
          <div className="icon">🔊</div>
          <div className="text">
            <h2>音量テスト</h2>
            <p>2つの音を聴き比べて、どちらの音量が大きいか当てよう</p>
          </div>
          <span className="arrow">›</span>
        </button>
        <button className="menu-card card-endless" onClick={() => handle('endless')}>
          <div className="icon">♾️</div>
          <div className="text">
            <h2>エンドレスモード</h2>
            <p>周波数と音量がランダムで出題。ミスしたら終了、連続正解を競おう</p>
          </div>
          <span className="arrow">›</span>
        </button>
      </div>

      <div className="footer">© 2026 音感トレーニング</div>
    </div>
  );
}
