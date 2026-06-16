'use client';

import { create } from 'zustand';
import type { DestinationCategory } from './types';

const STORAGE_KEY = 'booktrip.preferences';

interface PreferencesState {
  categories: DestinationCategory[];
  maxBudget: number;
  notifications: {
    priceChanged: boolean;
    seatsUpdated: boolean;
    tourCancelled: boolean;
    savedSearchAlerts: boolean;
  };
  hydrated: boolean;
  hydrate: () => void;
  setCategories: (cats: DestinationCategory[]) => void;
  setBudget: (budget: number) => void;
  setNotification: (key: keyof PreferencesState['notifications'], value: boolean) => void;
}

export const usePreferences = create<PreferencesState>((set, get) => ({
  categories: [],
  maxBudget: 0,
  notifications: {
    priceChanged: true,
    seatsUpdated: true,
    tourCancelled: true,
    savedSearchAlerts: true,
  },
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({
          categories: saved.categories ?? [],
          maxBudget: saved.maxBudget ?? 0,
          notifications: { ...get().notifications, ...saved.notifications },
          hydrated: true,
        });
        return;
      }
    } catch { /* ignore */ }
    set({ hydrated: true });
  },

  setCategories: (cats) => {
    set({ categories: cats });
    persist(get());
  },
  setBudget: (budget) => {
    set({ maxBudget: budget });
    persist(get());
  },
  setNotification: (key, value) => {
    set((s) => ({
      notifications: { ...s.notifications, [key]: value },
    }));
    persist(get());
  },
}));

function persist(state: PreferencesState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      categories: state.categories,
      maxBudget: state.maxBudget,
      notifications: state.notifications,
    }),
  );
}
