// src/components/studio/PatternSequencer.tsx
'use client';

import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Pattern } from '@/types';
import { Button } from '../ui/Button';

interface PatternSequencerProps {
  patterns: Pattern[];
  onPatternChange: (patterns: Pattern[]) => void;
}

export const PatternSequencer: React.FC<PatternSequencerProps> = ({
  patterns,
  onPatternChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
    
    const seq = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        patterns.forEach(pattern => {
          if (pattern.beats.includes(step)) {
            playSound(pattern.instrument, time);
          }
        });
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    );

    if (isPlaying) {
      seq.start(0);
    }

    return () => {
      seq.dispose();
    };
  }, [patterns, isPlaying, bpm]);

  const playSound = (instrument: string, time: number) => {
    // Add your sound triggering logic here
    console.log(`Playing ${instrument} at ${time}`);
  };

  const toggleBeat = (patternId: string, beat: number) => {
    const updatedPatterns = patterns.map(pattern => {
      if (pattern.id === patternId) {
        const beats = pattern.beats.includes(beat)
          ? pattern.beats.filter(b => b !== beat)
          : [...pattern.beats, beat];
        return { ...pattern, beats: beats.sort((a, b) => a - b) };
      }
      return pattern;
    });
    onPatternChange(updatedPatterns);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className={isPlaying ? 'bg-red-500' : 'bg-green-500'}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm">BPM:</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-gray-700 rounded"
              min="20"
              max="300"
            />
          </div>
        </div>
        <div className="text-sm">Step: {currentStep + 1}</div>
      </div>

      <div className="space-y-4">
        {patterns.map(pattern => (
          <div key={pattern.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{pattern.instrument}</span>
            </div>
            <div className="grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => toggleBeat(pattern.id, i)}
                  className={`
                    w-full h-8 rounded
                    ${pattern.beats.includes(i) ? 'bg-blue-500' : 'bg-gray-700'}
                    ${currentStep === i ? 'border-2 border-white' : ''}
                    hover:opacity-80 transition-colors
                  `}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};