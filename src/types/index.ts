// src/types/index.ts
export interface EffectParams {
  wet: number;
  [key: string]: number;
}

export interface Effect {
  id: string;
  type: string;
  params: EffectParams;
}

export interface Pattern {
  id: string;
  instrument: string;
  beats: number[];
}

export interface AudioClip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  audioUrl: string;
  volume: number;
}

export interface Track {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;
  clips: AudioClip[];
  patterns: Pattern[];
  effects: Effect[];
}