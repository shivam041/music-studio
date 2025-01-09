// src/components/studio/TrackList.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Track } from '@/types';
import { AudioTrack } from './AudioTrack';
import { useStudioStore } from '@/stores/useStudioStore';

export const TrackList: React.FC = () => {
  const { tracks, reorderTracks } = useStudioStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex(track => track.id === active.id);
      const newIndex = tracks.findIndex(track => track.id === over.id);
      reorderTracks(oldIndex, newIndex);
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => setActiveId(event.active.id as string)}
    >
      <SortableContext
        items={tracks.map(track => track.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {tracks.map((track) => (
            <AudioTrack
              key={track.id}
              track={track}
              isDragging={track.id === activeId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};