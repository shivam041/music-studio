// src/lib/audio/metronome.ts
import * as Tone from 'tone';

class MetronomeService {
  private highClick: Tone.Player;
  private lowClick: Tone.Player;
  private loop: Tone.Loop | null = null;

  constructor() {
    this.highClick = new Tone.Player({
      url: '/sounds/metronome-high.wav',
      volume: -10
    }).toDestination();

    this.lowClick = new Tone.Player({
      url: '/sounds/metronome-low.wav',
      volume: -10
    }).toDestination();
  }

  start() {
    if (this.loop) {
      this.loop.dispose();
    }

    this.loop = new Tone.Loop((time) => {
      const position = Tone.Transport.position.toString().split(':');
      const beat = parseInt(position[1]);
      
      if (beat === 0) {
        this.highClick.start(time);
      } else {
        this.lowClick.start(time);
      }
    }, '4n').start(0);
  }

  stop() {
    if (this.loop) {
      this.loop.dispose();
      this.loop = null;
    }
  }

  setVolume(volume: number) {
    const normalizedVolume = Math.max(-60, Math.min(0, volume));
    this.highClick.volume.value = normalizedVolume;
    this.lowClick.volume.value = normalizedVolume;
  }

  cleanup() {
    this.stop();
    this.highClick.dispose();
    this.lowClick.dispose();
  }
}

export const metronome = new MetronomeService();