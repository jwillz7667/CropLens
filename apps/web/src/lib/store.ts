import { create } from 'zustand';

type Theme = 'dark' | 'light';

type UIState = {
  theme: Theme;
  mapLayer: 'ndvi' | 'basemap';
  selectedFieldId?: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMapLayer: (layer: 'ndvi' | 'basemap') => void;
  setSelectedFieldId: (fieldId?: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  mapLayer: 'ndvi',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setMapLayer: (mapLayer) => set({ mapLayer }),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
}));
