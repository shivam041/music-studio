// src/app/studio/page.tsx
'use client';

import { useEffect, useState } from 'react';
import * as Tone from 'tone';
import { Transport } from '@/components/studio/Transport';
import { Mixer } from '@/components/studio/Mixer';
import { useStudioStore } from '@/stores/useStudioStore';
import { Button } from '@/components/ui/Button';
import { MockCollaborationProvider } from '@/contexts/CollaborationContext';
import { Track } from '@/types';

export default function StudioPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { tracks, addTrack } = useStudioStore();

  useEffect(() => {
    setIsMounted(true);
    // Initialize Tone.js
    const initTone = async () => {
      await Tone.start();
      console.log('Tone.js initialized');
    };
    initTone();
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: crypto.randomUUID(),
      name: `Track ${tracks.length + 1}`,
      volume: 0,
      muted: false,
      solo: false,
      pan: 0,
      clips: [],
      patterns: [
        {
          id: crypto.randomUUID(),
          instrument: 'Kick',
          beats: [],
        },
        {
          id: crypto.randomUUID(),
          instrument: 'Snare',
          beats: [],
        },
        {
          id: crypto.randomUUID(),
          instrument: 'Hi-Hat',
          beats: [],
        },
      ],
      effects: [], // Initialize with empty effects array
    };
    
    addTrack(newTrack);
  };

  return (
    <MockCollaborationProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-8">Music Studio</h1>
          
          <div className="mb-8">
            <Transport />
          </div>

          <div className="mb-8">
            <Mixer tracks={tracks} />
          </div>

          <Button 
            onClick={handleAddTrack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Track
          </Button>
        </div>
      </div>
    </MockCollaborationProvider>
  );
}