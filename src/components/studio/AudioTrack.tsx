// src/components/studio/AudioTrack.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Track } from '@/types';
import { useStudioStore } from '@/stores/useStudioStore';
import { Button } from '../ui/Button';
import { EffectsRack } from './EffectsRack';

interface AudioTrackProps {
  track: Track;
  isDragging?: boolean;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({ 
  track, 
  isDragging = false 
}) => {
  const [isReady, setIsReady] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const channelRef = useRef<Tone.Channel | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { 
    updateTrack, 
    isRecording, 
    currentTrackId,
    setRecording, 
    setCurrentTrackId,
    addClipToTrack,
    removeClipFromTrack
  } = useStudioStore();

  useEffect(() => {
    channelRef.current = new Tone.Channel({
      volume: track.volume,
      mute: track.muted,
      pan: track.pan,
    }).toDestination();

    return () => {
      channelRef.current?.dispose();
    };
  }, [track.volume, track.muted, track.pan]);

  useEffect(() => {
    const initializeAudioInput = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsReady(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error accessing audio input:', error);
        setIsReady(false);
      }
    };

    initializeAudioInput();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      
      recorderRef.current = new MediaRecorder(stream);
      
      recorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        addClipToTrack(track.id, {
          id: crypto.randomUUID(),
          trackId: track.id,
          startTime: Tone.Transport.seconds,
          duration: chunksRef.current.length / 44100, // Approximate duration
          audioUrl,
          volume: 0
        });

        stream.getTracks().forEach(track => track.stop());
      };

      recorderRef.current.start();
      setRecording(true);
      setCurrentTrackId(track.id);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setRecording(false);
      setCurrentTrackId(null);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    updateTrack(track.id, { volume: newVolume });
    channelRef.current?.set({ volume: newVolume });
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPan = Number(e.target.value);
    updateTrack(track.id, { pan: newPan });
    channelRef.current?.set({ pan: newPan });
  };

  return (
    <div 
      className={`
        bg-gray-800 rounded-lg p-4 
        ${isDragging ? 'opacity-50' : ''}
        transition-opacity duration-200
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{track.name}</span>
          <Button
            onClick={() => {
              if (isRecording && currentTrackId === track.id) {
                stopRecording();
              } else if (!isRecording) {
                startRecording();
              }
            }}
            disabled={!isReady || (isRecording && currentTrackId !== track.id)}
            className={`
              ${isRecording && currentTrackId === track.id ? 'bg-red-500' : 'bg-blue-500'}
              hover:opacity-90
            `}
          >
            {isRecording && currentTrackId === track.id ? 'Stop Recording' : 'Record'}
          </Button>
          <Button
            onClick={() => updateTrack(track.id, { solo: !track.solo })}
            className={`${track.solo ? 'bg-yellow-500' : 'bg-gray-600'}`}
          >
            {track.solo ? 'Un-Solo' : 'Solo'}
          </Button>
          <Button
            onClick={() => updateTrack(track.id, { muted: !track.muted })}
            className={track.muted ? 'bg-red-500' : 'bg-gray-600'}
          >
            {track.muted ? 'Unmute' : 'Mute'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">Pan</span>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={track.pan}
              onChange={handlePanChange}
              className="w-24"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">Volume</span>
            <input
              type="range"
              min="-60"
              max="0"
              value={track.volume}
              onChange={handleVolumeChange}
              className="w-32"
            />
          </div>
          <Button
            onClick={() => setShowEffects(!showEffects)}
            className="bg-purple-500"
          >
            Effects
          </Button>
        </div>
      </div>

      <div className="relative h-24 bg-gray-700 rounded">
        {track.clips.map((clip) => {
          const clipWidth = (clip.duration * 100); // Convert to percentage
          const clipLeft = (clip.startTime * 100); // Convert to percentage
          
          return (
            <div
              key={clip.id}
              className="absolute h-full bg-blue-500 opacity-75"
              style={{
                left: `${clipLeft}%`,
                width: `${clipWidth}%`
              }}
            >
              <div className="flex items-center justify-between p-2">
                <span className="text-xs truncate">
                  Clip {clip.id.slice(0, 4)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClipFromTrack(track.id, clip.id);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showEffects && (
        <div className="mt-4">
          <EffectsRack
            track={track}
            onEffectAdd={(effect) => {
              updateTrack(track.id, {
                effects: [...track.effects, effect]
              });
            }}
            onEffectUpdate={(effectId, params) => {
              updateTrack(track.id, {
                effects: track.effects.map(effect =>
                  effect.id === effectId
                    ? { ...effect, params }
                    : effect
                )
              });
            }}
            onEffectRemove={(effectId) => {
              updateTrack(track.id, {
                effects: track.effects.filter(effect => effect.id !== effectId)
              });
            }}
          />
        </div>
      )}
    </div>
  );
};