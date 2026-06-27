import { useState, useEffect } from 'react';
import type { Answer, Question } from '../types';
import { generateEndlessQuestion, checkAnswer } from '../question';
import { playTone } from '../audio';
import { submitScore, fetchRanking, type RankingEntry } from '../firebase';

interface Props {
  onBack: () => void;
}

export default function EndlessPage({ onBack }: Props) {
  const [q, setQ] = useState<Question>(() => generateEndlessQuestion(0));
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('endless_best') ?? 0));
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [failed, setFailed] = useState(false);

  const [showRanking, setShowRanking] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const [name, setName] = useState(() => localStorage.getItem('player_name') ?? '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const playA = () => {
    if (q.type === 'pitch') playTone(q.aFreq, 0);
    else playTone(440, q.aGain - 5);
  };
  const playB = () => {
    if (q.type === 'pitch') playTone(q.bFreq, 0);
    else playTone(440, q.bGain - 5);
  };

  const judge = async (answer: Answer) => {
    if (disabled) return;
    setDisabled(true);
    const correct = checkAnswer(q, answer);
    setResult(correct ? 'correct' : 'wrong');

    await new Promise(r => setTimeout(r, 900));
    setResult(null);

    if (!correct) {
      if (streak > best) {
        setBest(streak);
        localStorage.setItem('endless_best', String(streak));
      }
      setFailed(true);
      setSubmitted(false);
      setDisabled(false);
      return;
    }

    const next = streak + 1;
    setStreak(next);
    setQ(generateEndlessQuestion(next));
    setDisabled(false);
  };

  const retry = () => {
    setStreak(0);
    setFailed(false);
    setSubmitted(false);
    setQ(generateEndlessQuestion(0));
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    localStorage.setItem('player_name', name.trim());
    const maxLevel = Math.min(Math.floor(streak / 3) + 1, 5);
    await submitScore(name.trim(), streak, maxLevel);
    setSubmitted(true);
    setSubmitting(false);
  };

  const loadRanking = async () => {
    setShowRanking(true);
    setLoadingRanking(true);
    const data = await fetchRanking(20);
    setRanking(data);
    setLoadingRanking(false);
  };

  useEffect(() => {
    if (showRanking && !failed) {
      loadRanking();
    }
  }, [showRanking]);

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
  const btns = q.type === 'pitch' ? pitchBtns : decibelBtns;

  return (
    <div className="endless-page">
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <div className="logo-icon" style={{ background: 'linear-gradient(135deg,#06D6A0,#1B9AAA)' }}>♾️</div>
            <span style={{ color: '#06D6A0' }}>エンドレスモード</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <button className="navbar-back" onClick={loadRanking}>🏆 ランキング</button>
            <button className="navbar-back" onClick={onBack}>← 戻る</button>
          </div>
        </div>
      </nav>

      <div className="streak-board">
        <div className="streak-card current">
          <div className="s-label">現在の連続正解</div>
          <div className="s-value">{streak}</div>
        </div>
        <div className="streak-card best">
          <div className="s-label">ベスト</div>
          <div className="s-value">{best}</div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div className="type-badge">
          {q.type === 'pitch' ? '🎼 周波数テスト' : '🔊 音量テスト'}
          <span style={{ marginLeft: 8, color: '#888' }}>最高難度</span>
        </div>
      </div>

      <div className="play-area">
        <button className="play-btn" style={{ background: 'linear-gradient(135deg,#6C63FF,#9B8FFF)' }} onClick={playA}>
          <span className="play-icon">▶</span>A
        </button>
        <button className="play-btn" style={{ background: 'linear-gradient(135deg,#48CAE4,#00B4D8)' }} onClick={playB}>
          <span className="play-icon">▶</span>B
        </button>
      </div>

      <p className="question-text">{q.type === 'pitch' ? '周波数が高いのはどちら？' : '音が大きいのはどちら？'}</p>
      <p className="question-sub">ミスしたら終了！何問連続で正解できる？</p>

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

      {failed && (
        <div className="endless-fail-overlay">
          <div className="fail-dialog">
            <div className="fail-emoji">😢</div>
            <h2>ゲームオーバー</h2>
            <div className="fail-scores">
              <div className="fail-score-item current">
                <div className="fs-label">今回</div>
                <div className="fs-value">{streak}</div>
              </div>
              <div className="fail-score-item best">
                <div className="fs-label">ベスト</div>
                <div className="fs-value">{Math.max(streak, best)}</div>
              </div>
            </div>
            {streak > best && <p style={{ color: '#06D6A0', fontWeight: 700, marginBottom: 12 }}>🎉 新記録！</p>}

            {streak > 0 && !submitted && (
              <div className="submit-area">
                <p className="submit-label">ランキングに登録する</p>
                <input
                  className="name-input"
                  type="text"
                  placeholder="ニックネーム"
                  maxLength={12}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button className="submit-btn" onClick={handleSubmit} disabled={!name.trim() || submitting}>
                  {submitting ? '送信中...' : '登録する'}
                </button>
              </div>
            )}
            {submitted && <p className="submitted-msg">✅ ランキングに登録しました！</p>}

            <div className="fail-btns">
              <button className="fail-btn retry" onClick={retry}>もう一度</button>
              <button className="fail-btn ranking" onClick={() => { loadRanking(); }}>🏆 ランキング</button>
              <button className="fail-btn go-home" onClick={onBack}>ホームへ</button>
            </div>
          </div>
        </div>
      )}

      {showRanking && (
        <div className="ranking-overlay" onClick={() => setShowRanking(false)}>
          <div className="ranking-dialog" onClick={e => e.stopPropagation()}>
            <div className="ranking-top">
              <h2>🏆 ランキング</h2>
              <button className="ranking-close" onClick={() => setShowRanking(false)}>✕</button>
            </div>
            {loadingRanking ? (
              <p className="ranking-loading">読み込み中...</p>
            ) : ranking.length === 0 ? (
              <p className="ranking-loading">まだ記録がありません</p>
            ) : (
              <div className="ranking-list">
                {ranking.map((r, i) => (
                  <div key={i} className={`ranking-row ${i < 3 ? 'top3' : ''}`}>
                    <span className="rank-num">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                    </span>
                    <span className="rank-name">{r.name}</span>
                    <span className="rank-streak">{r.streak}<small>連続</small></span>
                    <span className="rank-level">Lv.{r.maxLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
