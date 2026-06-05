import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { WirePath, SimulationState, Theme, Language, Axis } from '@/domain/types'
import {
  addPoint,
  editCoordinate,
  dragPoint,
  deletePoint,
  renamePath,
} from '@/domain/path'
import { releaseSegmentConstraint } from '@/domain/constraints'
import { generateId, createEmptyPath } from '@/domain/utils'
import { savePath, loadAllPaths, deletePath } from '@/persistence/db'

function defaultPathName(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function newPath(): WirePath {
  return createEmptyPath(generateId(), defaultPathName(), Date.now())
}

interface AppState {
  // Paths
  currentPath: WirePath
  paths: Record<string, WirePath>

  // Undo/redo
  undoStack: WirePath[]
  redoStack: WirePath[]

  // Modes
  editMode: boolean
  orthoMode: boolean
  snapEnabled: boolean
  gridVisible: boolean
  gridSizeMm: number
  isMobile: boolean

  // Selection
  selectedPointId: string | null
  selectedSegmentId: string | null

  // Simulation
  simulation: SimulationState

  // App settings
  theme: Theme
  language: Language

  // Actions — path editing
  addPoint: (rawMmX: number, rawMmY: number) => void
  editCoordinate: (pointId: string, axis: Axis, value: number) => void
  dragPoint: (pointId: string, newX: number, newY: number) => void
  deletePoint: (pointId: string) => void
  releaseConstraint: (segmentId: string) => void
  releaseConstraintsByPoint: (pointId: string) => void

  // Actions — history
  newPathAction: () => Promise<void>
  clearCurrentPath: () => void
  openPath: (pathId: string) => Promise<void>
  renamePath: (pathId: string, name: string) => void
  deleteHistoryEntry: (pathId: string) => Promise<void>
  loadHistory: () => Promise<void>

  // Actions — undo/redo
  undo: () => void
  redo: () => void

  // Actions — mode
  setEditMode: (v: boolean) => void
  setOrthoMode: (v: boolean) => void
  setSnapEnabled: (v: boolean) => void
  setGridVisible: (v: boolean) => void
  setIsMobile: (v: boolean) => void

  // Actions — selection
  selectPoint: (id: string | null) => void
  selectSegment: (id: string | null) => void

  // Actions — simulation
  setSimulation: (s: Partial<SimulationState>) => void
  startSimulation: () => void
  stopSimulation: () => void

  // Actions — help modal
  helpOpen: boolean
  setHelpOpen: (v: boolean) => void

  // Actions — settings
  setTheme: (t: Theme) => void
  setLanguage: (l: Language) => void

  // Internal helpers
  _pushUndo: () => void
  _saveCurrentPath: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    currentPath: newPath(),
    paths: {},
    undoStack: [],
    redoStack: [],
    editMode: false,
    orthoMode: true,
    snapEnabled: true,
    gridVisible: true,
    gridSizeMm: 1,
    isMobile: false,
    selectedPointId: null,
    selectedSegmentId: null,
    simulation: {
      running: false,
      speedMmPerSec: 10,
      progress: 0,
      trailProgress: 0,
    },
    theme: 'system',
    language: 'ja',
    helpOpen: false,

    setHelpOpen(v) { set({ helpOpen: v }) },

    _pushUndo() {
      const { currentPath, undoStack } = get()
      set({
        undoStack: [...undoStack.slice(-49), currentPath],
        redoStack: [],
      })
    },

    async _saveCurrentPath() {
      const { currentPath } = get()
      const updated = { ...currentPath, updatedAt: Date.now() }
      set(state => ({
        currentPath: updated,
        paths: { ...state.paths, [updated.id]: updated },
      }))
      await savePath(updated)
    },

    addPoint(rawMmX, rawMmY) {
      const { currentPath, orthoMode, snapEnabled, gridSizeMm, _pushUndo } = get()
      _pushUndo()
      const updated = addPoint(currentPath, rawMmX, rawMmY, {
        orthoMode,
        snapEnabled,
        gridSizeMm,
      })
      set({ currentPath: { ...updated, updatedAt: Date.now() } })
    },

    editCoordinate(pointId, axis, value) {
      const { currentPath, _pushUndo } = get()
      _pushUndo()
      const updated = editCoordinate(currentPath, pointId, axis, value)
      set({ currentPath: { ...updated, updatedAt: Date.now() } })
      get()._saveCurrentPath()
    },

    dragPoint(pointId, newX, newY) {
      const { currentPath } = get()
      const updated = dragPoint(currentPath, pointId, newX, newY)
      set({ currentPath: { ...updated, updatedAt: Date.now() } })
    },

    deletePoint(pointId) {
      const { currentPath, _pushUndo } = get()
      _pushUndo()
      const updated = deletePoint(currentPath, pointId)
      set({
        currentPath: { ...updated, updatedAt: Date.now() },
        selectedPointId: null,
      })
      get()._saveCurrentPath()
    },

    releaseConstraint(segmentId) {
      const { currentPath, _pushUndo } = get()
      _pushUndo()
      const updated = releaseSegmentConstraint(currentPath, segmentId)
      set({ currentPath: { ...updated, updatedAt: Date.now() } })
      get()._saveCurrentPath()
    },

    releaseConstraintsByPoint(pointId) {
      const { currentPath, _pushUndo } = get()
      const segIds = currentPath.segments
        .filter(s => s.isConstrained && (s.fromPointId === pointId || s.toPointId === pointId))
        .map(s => s.id)
      if (segIds.length === 0) return
      _pushUndo()
      let updated = currentPath
      for (const id of segIds) updated = releaseSegmentConstraint(updated, id)
      set({ currentPath: { ...updated, updatedAt: Date.now() } })
      get()._saveCurrentPath()
    },

    async newPathAction() {
      const { currentPath, paths, _saveCurrentPath } = get()
      await _saveCurrentPath()
      const fresh = newPath()
      set({
        currentPath: fresh,
        paths: { ...paths, [currentPath.id]: { ...currentPath, updatedAt: Date.now() } },
        undoStack: [],
        redoStack: [],
        selectedPointId: null,
        selectedSegmentId: null,
      })
    },

    clearCurrentPath() {
      const fresh = newPath()
      set({
        currentPath: fresh,
        undoStack: [],
        redoStack: [],
        selectedPointId: null,
        selectedSegmentId: null,
      })
    },

    async openPath(pathId) {
      const { _saveCurrentPath, paths } = get()
      await _saveCurrentPath()
      const target = paths[pathId]
      if (target) {
        set({
          currentPath: target,
          undoStack: [],
          redoStack: [],
          selectedPointId: null,
          selectedSegmentId: null,
        })
      }
    },

    renamePath(pathId, name) {
      const { currentPath, paths } = get()
      if (pathId === currentPath.id) {
        const updated = renamePath(currentPath, name)
        set({ currentPath: updated })
        savePath(updated)
      } else if (paths[pathId]) {
        const updated = renamePath(paths[pathId], name)
        set({ paths: { ...paths, [pathId]: updated } })
        savePath(updated)
      }
    },

    async deleteHistoryEntry(pathId) {
      const { paths } = get()
      const updated = { ...paths }
      delete updated[pathId]
      set({ paths: updated })
      await deletePath(pathId)
    },

    async loadHistory() {
      const all = await loadAllPaths()
      const pathMap: Record<string, WirePath> = {}
      for (const p of all) {
        pathMap[p.id] = p
      }
      // Restore last active path if available
      const { currentPath } = get()
      const lastPath = all[0]
      if (lastPath && lastPath.id !== currentPath.id && currentPath.points.length === 0) {
        set({ currentPath: lastPath, paths: pathMap })
      } else {
        set({ paths: pathMap })
      }
    },

    undo() {
      const { undoStack, currentPath, redoStack } = get()
      if (undoStack.length === 0) return
      const prev = undoStack[undoStack.length - 1]
      set({
        currentPath: prev,
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, currentPath],
        selectedPointId: null,
      })
    },

    redo() {
      const { redoStack, currentPath, undoStack } = get()
      if (redoStack.length === 0) return
      const next = redoStack[redoStack.length - 1]
      set({
        currentPath: next,
        redoStack: redoStack.slice(0, -1),
        undoStack: [...undoStack, currentPath],
        selectedPointId: null,
      })
    },

    setEditMode(v) {
      set({ editMode: v })
    },

    setOrthoMode(v) {
      set({ orthoMode: v, snapEnabled: v })
    },

    setSnapEnabled(v) {
      set({ snapEnabled: v })
    },

    setGridVisible(v) {
      set({ gridVisible: v })
    },

    setIsMobile(v) {
      set({ isMobile: v })
    },

    selectPoint(id) {
      set({ selectedPointId: id, selectedSegmentId: null })
    },

    selectSegment(id) {
      set({ selectedSegmentId: id, selectedPointId: null })
    },

    setSimulation(s) {
      set(state => ({ simulation: { ...state.simulation, ...s } }))
    },

    startSimulation() {
      set(state => ({
        simulation: { ...state.simulation, running: true, progress: 0, trailProgress: 0 },
      }))
    },

    stopSimulation() {
      set(state => ({ simulation: { ...state.simulation, running: false } }))
    },

    setTheme(t) {
      set({ theme: t })
      const root = document.documentElement
      if (t === 'dark') root.setAttribute('data-theme', 'dark')
      else if (t === 'light') root.setAttribute('data-theme', 'light')
      else root.removeAttribute('data-theme')
      localStorage.setItem('theme', t)
    },

    setLanguage(l) {
      set({ language: l })
      localStorage.setItem('language', l)
    },
  }))
)
