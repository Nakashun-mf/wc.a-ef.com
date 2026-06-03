export interface Point {
  id: string;
  x: number;
  y: number;
  freePlaced: boolean;
}

export interface Segment {
  id: string;
  fromPointId: string;
  toPointId: string;
  orientation: 'horizontal' | 'vertical' | 'free';
  isConstrained: boolean;
}

export interface WirePath {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  points: Point[];
  segments: Segment[];
  hasBeenEdited: boolean;
}

export interface SimulationState {
  running: boolean;
  speedMmPerSec: number;
  progress: number;
  trailProgress: number;
}

export type Axis = 'x' | 'y';

export type Language = 'ja' | 'en';
export type Theme = 'light' | 'dark' | 'system';
