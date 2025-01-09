// src/components/studio/Timeline.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useStudioStore } from '@/stores/useStudioStore';

interface TimelineProps {
  pixelsPerSecond?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  pixelsPerSecond = 100
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tracks = useStudioStore(state => state.tracks);
  const [duration, setDuration] = useState(0);

  // Calculate total duration based on clips
  useEffect(() => {
    const calculateDuration = () => {
      let maxDuration = 0;
      tracks.forEach(track => {
        track.clips.forEach(clip => {
          const clipEnd = clip.startTime + clip.duration;
          if (clipEnd > maxDuration) {
            maxDuration = clipEnd;
          }
        });
      });
      // Add some padding and ensure minimum duration
      return Math.max(maxDuration + 5, 30); // Minimum 30 seconds
    };

    setDuration(calculateDuration());
  }, [tracks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = duration * pixelsPerSecond;
    canvas.width = width;

    // Draw timeline
    const drawTimeline = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, canvas.height);
      ctx.fillStyle = '#374151';
      ctx.fillRect(0, 0, width, canvas.height);

      // Draw markers
      ctx.strokeStyle = '#9CA3AF';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';

      for (let i = 0; i <= duration; i++) {
        const x = i * pixelsPerSecond;
        
        // Draw second markers
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

        // Draw time labels
        const minutes = Math.floor(i / 60);
        const seconds = i % 60;
        const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        ctx.fillText(timeLabel, x, 10);
      }

      // Draw playhead
      const playheadX = (Tone.Transport.seconds || 0) * pixelsPerSecond;
      ctx.strokeStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height);
      ctx.stroke();
    };

    const animate = () => {
      drawTimeline();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup
    };
  }, [duration, pixelsPerSecond]);

  return (
    <div className="w-full overflow-x-auto">
      <canvas
        ref={canvasRef}
        height={20}
        className="h-5 min-w-full"
      />
    </div>
  );
};