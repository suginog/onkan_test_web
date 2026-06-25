const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

export function playTone(frequency: number, gainDb: number, duration = 1.2): void {
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
