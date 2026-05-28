export interface Segment {
  id: string;
  label: string;
  description?: string;
  durationSeconds: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
