// src/stores/useStudioStore.ts
import { create } from 'zustand';
import * as Tone from 'tone';
import { Track, Pattern, AudioClip } from '@/types';
import { metronome } from '@/lib/audio/metronome';

interface StudioState {
  // State
  tracks: Track[];
  isRecording: boolean;
  isPlaying: boolean;
  currentTrackId: string | null;
  isMetronomeEnabled: boolean;
  metronomeVolume: number;
  bpm: number;

  // Actions
  setRecording: (isRecording: boolean) => void;
  setCurrentTrackId: (trackId: string | null) => void;
  togglePlayback: () => Promise<void>;
  stopPlayback: () => void;
  toggleRecording: () => Promise<void>;
  toggleMetronome: () => void;
  setMetronomeVolume: (volume: number) => void;
  setBpm: (bpm: number) => void;
  
  // Track Management
  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  addClipToTrack: (trackId: string, clip: AudioClip) => void;
  removeClipFromTrack: (trackId: string, clipId: string) => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial State
  tracks: [],
  isRecording: false,
  isPlaying: false,
  currentTrackId: null,
  isMetronomeEnabled: false,
  metronomeVolume: -10,
  bpm: 120,

  // Basic State Actions
  setRecording: (isRecording) => set({ isRecording }),
  setCurrentTrackId: (trackId) => set({ currentTrackId: trackId }),

  // Transport Controls
  togglePlayback: async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      if (Tone.Transport.state === 'started') {
        Tone.Transport.pause();
        set({ isPlaying: false });
      } else {
        Tone.Transport.start();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      set({ isPlaying: false });
    }
  },

  stopPlayback: () => {
    try {
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      set({ 
        isPlaying: false,
        isRecording: false
      });
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  },

  toggleRecording: async () => {
    const state = get();
    
    try {
      if (!state.isRecording) {
        if (!state.currentTrackId) {
          throw new Error('No track selected for recording');
        }

        if (Tone.context.state !== 'running') {
          await Tone.start();
        }

        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
          set({ isPlaying: true });
        }

        set({ isRecording: true });
      } else {
        set({ isRecording: false });
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      set({ isRecording: false });
    }
  },

  toggleMetronome: () => {
    const state = get();
    const newState = !state.isMetronomeEnabled;
    
    if (newState) {
      metronome.start();
    } else {
      metronome.stop();
    }
    
    set({ isMetronomeEnabled: newState });
  },

  setMetronomeVolume: (volume) => {
    metronome.setVolume(volume);
    set({ metronomeVolume: volume });
  },

  setBpm: (bpm) => {
    Tone.Transport.bpm.value = bpm;
    set({ bpm });
  },

  // Track Management
  addTrack: (track) => 
    set((state) => ({ tracks: [...state.tracks, track] })),

  removeTrack: (id) => 
    set((state) => ({ 
      tracks: state.tracks.filter(t => t.id !== id),
      currentTrackId: state.currentTrackId === id ? null : state.currentTrackId
    })),

  updateTrack: (id, updates) =>
    set((state) => ({
      tracks: state.tracks.map(track =>
        track.id === id ? { ...track, ...updates } : track
      ),
    })),

  reorderTracks: (startIndex: number, endIndex: number) =>
    set((state) => {
      const newTracks = Array.from(state.tracks);
      const [removed] = newTracks.splice(startIndex, 1);
      newTracks.splice(endIndex, 0, removed);
      return { tracks: newTracks };
    }),

    addClipToTrack: (trackId, clip) =>
        set((state) => {
          // Calculate clip duration if not provided
          const clipDuration = clip.duration || 0;
          
          return {
            tracks: state.tracks.map(track =>
              track.id === trackId
                ? {
                    ...track,
                    clips: [...track.clips, {
                      ...clip,
                      duration: clipDuration
                    }]
                  }
                : track
            ),
          };
        }),

  removeClipFromTrack: (trackId, clipId) =>
    set((state) => ({
      tracks: state.tracks.map(track =>
        track.id === trackId
          ? { ...track, clips: track.clips.filter(clip => clip.id !== clipId) }
          : track
      ),
    })),
}));