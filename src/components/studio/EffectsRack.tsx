// src/components/studio/EffectsRack.tsx
'use client';

import { useState } from 'react';
import { Effect, EffectParams, Track } from '@/types';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';

interface EffectDefinition {
  type: string;
  defaultParams: EffectParams;
  controls: {
    name: string;
    param: string;
    min: number;
    max: number;
    step: number;
  }[];
}

const AVAILABLE_EFFECTS: EffectDefinition[] = [
  {
    type: 'reverb',
    defaultParams: {
      wet: 0.5,
      decay: 1.5,
      preDelay: 0.1,
    },
    controls: [
      { name: 'Mix', param: 'wet', min: 0, max: 1, step: 0.01 },
      { name: 'Decay', param: 'decay', min: 0.1, max: 10, step: 0.1 },
      { name: 'Pre-Delay', param: 'preDelay', min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    type: 'delay',
    defaultParams: {
      wet: 0.5,
      delayTime: 0.25,
      feedback: 0.3,
    },
    controls: [
      { name: 'Mix', param: 'wet', min: 0, max: 1, step: 0.01 },
      { name: 'Time', param: 'delayTime', min: 0, max: 1, step: 0.01 },
      { name: 'Feedback', param: 'feedback', min: 0, max: 0.99, step: 0.01 },
    ],
  },
  {
    type: 'distortion',
    defaultParams: {
      wet: 0.5,
      distortion: 0.4,
      oversample: 0,
    },
    controls: [
      { name: 'Mix', param: 'wet', min: 0, max: 1, step: 0.01 },
      { name: 'Amount', param: 'distortion', min: 0, max: 1, step: 0.01 },
      { name: 'Oversample', param: 'oversample', min: 0, max: 2, step: 1 },
    ],
  },
  {
    type: 'chorus',
    defaultParams: {
      wet: 0.5,
      frequency: 4,
      depth: 0.5,
      spread: 0.5,
    },
    controls: [
      { name: 'Mix', param: 'wet', min: 0, max: 1, step: 0.01 },
      { name: 'Rate', param: 'frequency', min: 0.1, max: 10, step: 0.1 },
      { name: 'Depth', param: 'depth', min: 0, max: 1, step: 0.01 },
      { name: 'Spread', param: 'spread', min: 0, max: 1, step: 0.01 },
    ],
  },
];

interface EffectsRackProps {
  track: Track;
  onEffectAdd: (effect: Effect) => void;
  onEffectUpdate: (effectId: string, params: EffectParams) => void;
  onEffectRemove: (effectId: string) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({
  track,
  onEffectAdd,
  onEffectUpdate,
  onEffectRemove,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddEffect = (type: string) => {
    const effectConfig = AVAILABLE_EFFECTS.find((e: EffectDefinition) => e.type === type);
    if (!effectConfig) return;

    const newEffect: Effect = {
      id: crypto.randomUUID(),
      type,
      params: effectConfig.defaultParams,
    };

    onEffectAdd(newEffect);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Effects</h3>
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close' : 'Open'} Effects
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EFFECTS.map((effectDef: EffectDefinition) => (
              <Button
                key={effectDef.type}
                onClick={() => handleAddEffect(effectDef.type)}
                disabled={track.effects.some((e: Effect) => e.type === effectDef.type)}
                className="text-sm"
              >
                Add {effectDef.type}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {track.effects.map((effect: Effect) => {
              const effectDef = AVAILABLE_EFFECTS.find((e: EffectDefinition) => e.type === effect.type);
              if (!effectDef) return null;

              return (
                <div key={effect.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="capitalize">{effect.type}</span>
                    <Button
                      onClick={() => onEffectRemove(effect.id)}
                      className="text-sm bg-red-500 hover:bg-red-600"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {effectDef.controls.map((control) => (
                      <div key={control.param} className="flex items-center gap-2">
                        <span className="text-sm w-20">{control.name}:</span>
                        <Slider
                          value={[effect.params[control.param]]}
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          onValueChange={([newValue]) => {
                            onEffectUpdate(effect.id, {
                              ...effect.params,
                              [control.param]: newValue,
                            });
                          }}
                        />
                        <span className="text-sm w-12">
                          {effect.params[control.param].toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};