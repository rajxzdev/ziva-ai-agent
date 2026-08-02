'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  RoleConfig, Edge, NodePos, KeyEntry, RunRecord, Settings, ProviderId, RoleTemplate,
} from '@/types';
import { DEFAULT_ROLES, DEFAULT_EDGES, DEFAULT_POSITIONS } from './roles';

export const STORAGE_KEY = 'ziva.agent.ai.v1';

interface ZivaState {
  roles: RoleConfig[];
  edges: Edge[];
  positions: Record<string, NodePos>;
  keys: Partial<Record<ProviderId, KeyEntry>>;
  history: RunRecord[];
  templates: RoleTemplate[];
  settings: Settings;
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  updateRole: (id: string, patch: Partial<RoleConfig>) => void;
  toggleRole: (id: string) => void;
  resetRole: (id: string) => void;
  resetAllRoles: () => void;
  syncDefaultPipeline: () => void;
  bulkAssign: (provider: ProviderId, model: string) => void;

  setPosition: (id: string, pos: NodePos) => void;
  resetPositions: () => void;
  toggleEdge: (from: string, to: string) => void;

  saveKey: (entry: KeyEntry) => void;
  removeKey: (provider: ProviderId) => void;
  markKey: (provider: ProviderId, verified: 'unknown' | 'ok' | 'fail') => void;

  pushRun: (run: RunRecord) => void;
  removeRun: (id: string) => void;
  clearHistory: () => void;
  saveTemplate: (template: RoleTemplate) => void;
  removeTemplate: (id: string) => void;

  setSettings: (patch: Partial<Settings>) => void;
  importState: (raw: string) => { ok: boolean; message: string };
  hardReset: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accent: 'aurora',
  motion: true,
  dots: false,
  glass: true,
  autoSim: true,
  concurrency: 3,
  language: 'en',
};

export const useZiva = create<ZivaState>()(
  persist(
    (set, get) => ({
      roles: DEFAULT_ROLES,
      edges: DEFAULT_EDGES,
      positions: DEFAULT_POSITIONS,
      keys: {},
      history: [],
      templates: [],
      settings: DEFAULT_SETTINGS,
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      updateRole: (id, patch) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

      toggleRole: (id) =>
        set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) })),

      resetRole: (id) =>
        set((s) => ({
          roles: s.roles.map((r) => {
            if (r.id !== id) return r;
            const d = DEFAULT_ROLES.find((x) => x.id === id);
            return d ? { ...d } : r;
          }),
        })),

      resetAllRoles: () => set({ roles: DEFAULT_ROLES.map((r) => ({ ...r })) }),

      // Adds newly shipped roles to an existing browser workspace without replacing
      // the user's provider, model, API, prompt, or enabled-state choices.
      syncDefaultPipeline: () => set((s) => {
        const saved = new Map(s.roles.map((role) => [role.id, role]));
        const roles = DEFAULT_ROLES.map((role) => ({ ...role, ...(saved.get(role.id) ?? {}) }));
        const custom = s.roles.filter((role) => !DEFAULT_ROLES.some((base) => base.id === role.id));
        const edges = [...DEFAULT_EDGES, ...s.edges].filter((edge, index, list) => list.findIndex((item) => item.from === edge.from && item.to === edge.to) === index);
        return { roles: [...roles, ...custom], edges, positions: { ...DEFAULT_POSITIONS, ...s.positions } };
      }),

      bulkAssign: (provider, model) =>
        set((s) => ({ roles: s.roles.map((r) => ({ ...r, provider, model: model || r.model })) })),

      setPosition: (id, pos) => set((s) => ({ positions: { ...s.positions, [id]: pos } })),
      resetPositions: () => set({ positions: { ...DEFAULT_POSITIONS } }),

      toggleEdge: (from, to) =>
        set((s) => {
          const exists = s.edges.some((e) => e.from === from && e.to === to);
          return {
            edges: exists
              ? s.edges.filter((e) => !(e.from === from && e.to === to))
              : [...s.edges, { from, to }],
          };
        }),

      saveKey: (entry) =>
        set((s) => ({ keys: { ...s.keys, [entry.provider]: { ...entry, updatedAt: Date.now() } } })),

      removeKey: (provider) =>
        set((s) => {
          const next = { ...s.keys };
          delete next[provider];
          return { keys: next };
        }),

      markKey: (provider, verified) =>
        set((s) => {
          const cur = s.keys[provider];
          if (!cur) return {};
          return { keys: { ...s.keys, [provider]: { ...cur, verified } } };
        }),

      pushRun: (run) => set((s) => ({ history: [run, ...s.history].slice(0, 40) })),
      removeRun: (id) => set((s) => ({ history: s.history.filter((r) => r.id !== id) })),
      clearHistory: () => set({ history: [] }),
      saveTemplate: (template) => set((s) => ({ templates: [template, ...s.templates.filter((item) => item.id !== template.id)].slice(0, 20) })),
      removeTemplate: (id) => set((s) => ({ templates: s.templates.filter((item) => item.id !== id) })),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      importState: (raw) => {
        try {
          const data = JSON.parse(raw);
          const payload = data?.state ?? data;
          if (!payload || typeof payload !== 'object') throw new Error('Format tidak dikenal');
          set({
            roles: Array.isArray(payload.roles) && payload.roles.length ? payload.roles : get().roles,
            edges: Array.isArray(payload.edges) ? payload.edges : get().edges,
            positions: payload.positions ?? get().positions,
            keys: payload.keys ?? get().keys,
            history: Array.isArray(payload.history) ? payload.history : get().history,
            templates: Array.isArray(payload.templates) ? payload.templates : get().templates,
            settings: { ...get().settings, ...(payload.settings ?? {}) },
          });
          return { ok: true, message: 'Konfigurasi berhasil dipulihkan.' };
        } catch (e) {
          return { ok: false, message: (e as Error).message || 'File tidak valid.' };
        }
      },

      hardReset: () =>
        set({
          roles: DEFAULT_ROLES.map((r) => ({ ...r })),
          edges: [...DEFAULT_EDGES],
          positions: { ...DEFAULT_POSITIONS },
          keys: {},
          history: [],
          templates: [],
          settings: { ...DEFAULT_SETTINGS },
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        roles: s.roles, edges: s.edges, positions: s.positions,
        keys: s.keys, history: s.history, templates: s.templates, settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(true); },
    },
  ),
);

export const exportState = () => {
  const s = useZiva.getState();
  return JSON.stringify(
    {
      app: 'ziva-agent-ai', version: 1, exportedAt: new Date().toISOString(),
      state: { roles: s.roles, edges: s.edges, positions: s.positions, keys: s.keys, settings: s.settings },
    },
    null, 2,
  );
};
