// src/components/studio/Transport.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Button } from '../ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useStudioStore } from '@/stores/useStudioStore';

interface TransportProps {
  className?: string;
}

export const Transport: React.FC<TransportProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isMounted, setIsMounted] = useState(false);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    isPlaying,
    isRecording,
    isMetronomeEnabled,
    metronomeVolume,
    currentTrackId,
    togglePlayback,
    stopPlayback,
    toggleRecording,
    toggleMetronome,
    setMetronomeVolume
  } = useStudioStore();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const updateTime = () => {
      setCurrentTime(formatTime(Tone.Transport.seconds));
    };

    if (isPlaying) {
      timeIntervalRef.current = setInterval(updateTime, 100);
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [isPlaying, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 p-4 bg-gray-800 rounded-lg ${className}`}>
      <div className="flex space-x-2">
        <Button
          onClick={() => togglePlayback()}
          variant={isPlaying ? 'secondary' : 'primary'}
          disabled={false}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button
          onClick={() => stopPlayback()}
          variant="secondary"
          disabled={!isPlaying && !isRecording}
        >
          Stop
        </Button>

        <Button
          onClick={() => toggleRecording()}
          variant={isRecording ? 'secondary' : 'primary'}
          disabled={!currentTrackId}
          className={isRecording ? 'bg-red-500 hover:bg-red-600' : ''}
        >
          {isRecording ? 'Stop Recording' : 'Record'}
        </Button>

        <Button
          onClick={() => toggleMetronome()}
          variant={isMetronomeEnabled ? 'secondary' : 'primary'}
          className={`
            flex items-center gap-2
            ${isMetronomeEnabled ? 'bg-blue-500 hover:bg-blue-600' : ''}
          `}
        >
          <MetronomeIcon />
          {isMetronomeEnabled ? 'Metronome On' : 'Metronome Off'}
        </Button>

        {isMetronomeEnabled && (
          <div className="flex items-center gap-2 w-32">
            <span className="text-xs text-gray-400">Vol</span>
            <Slider
              value={[metronomeVolume]}
              min={-60}
              max={0}
              step={1}
              onValueChange={([value]) => setMetronomeVolume(value)}
            />
          </div>
        )}
      </div>

      <div className="text-sm text-gray-300 font-mono">
        {currentTime}
      </div>

      {isRecording && (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-500">Recording</span>
        </div>
      )}
    </div>
  );
};

const MetronomeIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};