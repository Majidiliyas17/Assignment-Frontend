'use client';

import { create } from 'zustand';

interface UiState {
  uploadOpen: boolean;
  commandOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  uploadOpen: false,
  commandOpen: false,
  setUploadOpen: (open) => set({ uploadOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
}));