const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
const BASE = import.meta.env.BASE_URL;

export function playTone(frequency: number, gainDb: number, duration = 2.0): void {
  const gain = ctx.createGain();
  const osc = ctx.createOscillator();

  const linearGain = Math.pow(10, gainDb / 20);
  gain.gain.setValueAtTime(linearGain * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function resume() {
  if (ctx.state === 'suspended') ctx.resume();
}

export function playSE(name: 'button' | 'pinpon' | 'batsu' | 'clear' | 'fail'): void {
  const audio = new Audio(`${BASE}sounds/${name}.mp3`);
  audio.volume = 0.6;
  audio.play().catch(() => {});
}

let bgmAudio: HTMLAudioElement | null = null;

export function playBGM(): void {
  if (bgmAudio) return;
  bgmAudio = new Audio(`${BASE}sounds/shaka.wav`);
  bgmAudio.loop = true;
  bgmAudio.volume = 0.3;
  bgmAudio.play().catch(() => {});
}

export function stopBGM(): void {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio = null;
  }
}
