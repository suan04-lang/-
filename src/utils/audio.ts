// Web Audio API Synthesizer for rich, responsive sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClinkSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // High crystalline glass clink
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2200, now);
    osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.35);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3300, now);
    osc2.frequency.exponentialRampToValueAtTime(2800, now + 0.25);

    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now);
    osc2.stop(now + 0.25);
  } catch {
    // Ignore audio failures if restricted
  }
}

export function playGulpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two consecutive gulp throat sounds
    [0, 0.16].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now + delay);

      osc.type = 'sine';
      const startFreq = idx === 0 ? 140 : 180;
      const endFreq = idx === 0 ? 320 : 380;
      osc.frequency.setValueAtTime(startFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.08);
      osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.14);

      gain.gain.setValueAtTime(0.35, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  } catch {
    // Ignore
  }
}

export function playPourSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Bubble series
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, now + delay);
      osc.frequency.exponentialRampToValueAtTime(600 + Math.random() * 300, now + delay + 0.05);

      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.06);
    }
  } catch {
    // Ignore
  }
}

export function playHiccupSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Ignore
  }
}

export function playCheerChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 3 arpeggio notes (Major triad)
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + delay);

      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  } catch {
    // Ignore
  }
}

export function triggerVibration(pattern: number | number[] = 50) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }
}
