export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.drumGain = null;
    this.enabled = false;
    this.musicTimer = null;
    this.intensity = 0;
  }

  async start() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.28;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.12;
      this.musicGain.connect(this.master);
      this.drumGain = this.ctx.createGain();
      this.drumGain.gain.value = 0.05;
      this.drumGain.connect(this.master);
    }
    await this.ctx.resume();
    this.enabled = true;
    this.startMusic();
  }

  toggle() {
    if (this.enabled) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  stop() {
    this.enabled = false;
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    if (this.ctx) this.ctx.suspend();
  }

  startMusic() {
    if (this.musicTimer || !this.ctx) return;
    const notes = [55, 82.4, 110, 164.8, 220, 246.9, 164.8, 110];
    let step = 0;
    this.musicTimer = window.setInterval(() => {
      if (!this.enabled) return;
      const freq = notes[step % notes.length] * (step % 8 > 5 && this.intensity > 0.55 ? 2 : 1);
      this.tone(freq, 0.15, 'sawtooth', this.musicGain, 0.035 + this.intensity * 0.035);
      if (step % 4 === 0) this.noise(0.07, 0.018 + this.intensity * 0.028, 600);
      if (this.intensity > 0.45 && step % 2 === 1) this.tone(110, 0.045, 'square', this.drumGain, 0.035);
      step += 1;
    }, 190);
  }

  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));
    if (!this.ctx || !this.musicGain) return;
    this.musicGain.gain.setTargetAtTime(0.1 + this.intensity * 0.08, this.ctx.currentTime, 0.2);
  }

  tone(freq, duration = 0.1, type = 'sine', target = this.master, volume = 0.12) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(target);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  noise(duration = 0.13, volume = 0.08, cutoff = 900) {
    if (!this.enabled || !this.ctx) return;
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    filter.type = 'highpass';
    filter.frequency.value = cutoff;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
  }

  pickup(type, combo = 0) {
    const base = type === 'coin' ? 860 : type === 'shield' ? 520 : type === 'burst' ? 1080 : 680;
    this.tone(base + Math.min(combo, 16) * 16, 0.08, 'triangle', this.master, 0.13);
    this.tone(base * 1.5, 0.12, 'sine', this.master, 0.08);
  }

  countdown() {
    this.tone(440, 0.08, 'triangle', this.master, 0.08);
  }

  go() {
    this.tone(660, 0.12, 'triangle', this.master, 0.12);
    this.tone(990, 0.18, 'sine', this.master, 0.08);
  }

  jump() {
    this.tone(330, 0.09, 'triangle', this.master, 0.1);
  }

  slide() {
    this.noise(0.16, 0.05, 1500);
  }

  collision(shielded = false) {
    this.noise(shielded ? 0.14 : 0.22, shielded ? 0.1 : 0.16, shielded ? 1200 : 260);
    this.tone(shielded ? 220 : 74, shielded ? 0.12 : 0.22, 'sawtooth', this.master, shielded ? 0.09 : 0.14);
  }

  gameOver() {
    this.tone(130, 0.26, 'sawtooth', this.master, 0.12);
    window.setTimeout(() => this.tone(92, 0.3, 'sawtooth', this.master, 0.1), 120);
  }
}
