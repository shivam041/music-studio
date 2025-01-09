// src/components/ui/Slider.tsx
'use client';

import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange
}) => {
  return (
    <RadixSlider.Root
      className="relative flex items-center select-none touch-none w-full h-5"
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
    >
      <RadixSlider.Track className="bg-gray-600 relative grow rounded-full h-1">
        <RadixSlider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-4 h-4 bg-white rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Volume"
      />
    </RadixSlider.Root>
  );
};