// src/lib/audio/effects.ts
import * as Tone from 'tone';

export interface EffectParams {
  wet?: number;
  [key: string]: any;
}

export class EffectChain {
  private effects: Map<string, any> = new Map();
  private input: Tone.Channel;
  private output: Tone.Channel;

  constructor(input: Tone.Channel, output: Tone.Channel) {
    this.input = input;
    this.output = output;
  }

  addEffect(type: string, params: EffectParams = {}) {
    let effect: any;

    switch (type) {
      case 'reverb':
        effect = new Tone.Reverb({
          decay: params.decay || 1.5,
          wet: params.wet || 0.5,
        }).toDestination();
        break;

      case 'delay':
        effect = new Tone.FeedbackDelay({
          delayTime: params.delayTime || '8n',
          feedback: params.feedback || 0.3,
          wet: params.wet || 0.5,
        }).toDestination();
        break;

      case 'distortion':
        effect = new Tone.Distortion({
          distortion: params.distortion || 0.4,
          wet: params.wet || 0.5,
        }).toDestination();
        break;

      case 'chorus':
        effect = new Tone.Chorus({
          frequency: params.frequency || 4,
          delayTime: params.delayTime || 2.5,
          depth: params.depth || 0.5,
          wet: params.wet || 0.5,
        }).toDestination();
        break;

      case 'eq3':
        effect = new Tone.EQ3({
          low: params.low || 0,
          mid: params.mid || 0,
          high: params.high || 0,
          lowFrequency: params.lowFrequency || 400,
          highFrequency: params.highFrequency || 2500,
        }).toDestination();
        break;

      default:
        throw new Error(`Unknown effect type: ${type}`);
    }

    this.effects.set(type, effect);
    this.reconnectChain();
    return effect;
  }

  removeEffect(type: string) {
    const effect = this.effects.get(type);
    if (effect) {
      effect.dispose();
      this.effects.delete(type);
      this.reconnectChain();
    }
  }

  updateEffect(type: string, params: EffectParams) {
    const effect = this.effects.get(type);
    if (effect) {
      Object.entries(params).forEach(([key, value]) => {
        if (key in effect) {
          effect[key].value = value;
        }
      });
    }
  }

  private reconnectChain() {
    // Disconnect all
    this.input.disconnect();
    this.effects.forEach(effect => effect.disconnect());

    // Reconnect in series
    let current: Tone.ToneAudioNode = this.input;
    this.effects.forEach(effect => {
      current.connect(effect);
      current = effect;
    });
    current.connect(this.output);
  }

  dispose() {
    this.effects.forEach(effect => effect.dispose());
    this.effects.clear();
  }
}