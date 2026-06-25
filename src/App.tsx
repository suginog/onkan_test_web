import { useState } from 'react';
import './App.css';
import type { Mode } from './types';
import HomePage from './pages/HomePage';
import LevelPage from './pages/LevelPage';
import TestPage from './pages/TestPage';
import EndlessPage from './pages/EndlessPage';

export default function App() {
  const [mode, setMode] = useState<Mode>('home');
  const [level, setLevel] = useState(1);

  if (mode === 'home') return <HomePage onSelect={(m, l) => { setMode(m); if (l) setLevel(l); }} />;
  if (mode === 'pitch')   return <LevelPage type="pitch"   onBack={() => setMode('home')} onStart={l => setLevel(l)} level={level} onGoTest={() => setMode('pitch-test' as any)} />;
  if (mode === 'decibel') return <LevelPage type="decibel" onBack={() => setMode('home')} onStart={l => setLevel(l)} level={level} onGoTest={() => setMode('decibel-test' as any)} />;
  if ((mode as string) === 'pitch-test')   return <TestPage type="pitch"   level={level} onBack={() => setMode('pitch')}   />;
  if ((mode as string) === 'decibel-test') return <TestPage type="decibel" level={level} onBack={() => setMode('decibel')} />;
  if (mode === 'endless') return <EndlessPage onBack={() => setMode('home')} />;
  return null;
}
