// src/contexts/CollaborationContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Track } from '@/types';

interface CollaborationContextType {
  sendTrackUpdate: (trackId: string, updates: Partial<Track>) => void;
  notifyRecordingStarted: (trackId: string) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

const mockCollaborationValue: CollaborationContextType = {
  sendTrackUpdate: (trackId: string, updates: Partial<Track>) => {
    console.log('Mock track update:', { trackId, updates });
  },
  notifyRecordingStarted: (trackId: string) => {
    console.log('Mock recording started:', trackId);
  },
};

export const MockCollaborationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <CollaborationContext.Provider value={mockCollaborationValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    return mockCollaborationValue;
  }
  return context;
};