import { useSettingsStore } from '../../entities/settings/model/store';

type SoundType = 'click' | 'move' | 'win' | 'loss' | 'notification';

class SoundService {
  private context: AudioContext | null = null;

  private init() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.context = new AudioContextClass();
    }
  }

  private playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  vol = 0.1)
  {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);

    gain.gain.setValueAtTime(vol, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  play(type: SoundType) {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;

    this.init();
    if (!this.context) return;

    // Resume context if suspended (browser policy)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    switch (type) {
      case 'click':
        this.playTone(600, 'sine', 0.05, 0.05);
        break;
      case 'move':
        this.playTone(400, 'sine', 0.1, 0.05);
        break;
      case 'win':
        this.playTone(440, 'sine', 0.1);
        setTimeout(() => this.playTone(554, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(659, 'sine', 0.3), 200);
        break;
      case 'loss':
        this.playTone(300, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.4), 200);
        break;
      case 'notification':
        this.playTone(800, 'sine', 0.1);
        setTimeout(() => this.playTone(1200, 'sine', 0.2), 100);
        break;
    }
  }
}

export const soundService = new SoundService();