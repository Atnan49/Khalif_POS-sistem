// Synthesize 1400Hz 80ms beep audio and 60ms haptic vibration per PRD 3.1
export function triggerScanSuccessFeedback() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (err) {
    console.warn('Audio feedback unavailable:', err);
  }

  // Trigger haptic vibration if supported on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(60);
    } catch {
      // Ignore vibration error on unsupported devices
    }
  }
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000) {
    const inJuta = value / 1_000_000;
    return `Rp ${inJuta.toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }
  return formatRupiah(value);
}
