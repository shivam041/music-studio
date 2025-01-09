// src/components/studio/Mixer.tsx
'use client';

import { Track } from '@/types';
import { AudioTrack } from './AudioTrack';

interface MixerProps {
  tracks: Track[];
}

export const Mixer: React.FC<MixerProps> = ({ tracks }) => {
  return (
    <div className="grid gap-4">
      {tracks.map((track) => (
        <AudioTrack key={track.id} track={track} />
      ))}
      {tracks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tracks added yet. Click "Add Track" to get started.
        </div>
      )}
    </div>
  );
};