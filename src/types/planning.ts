// Planning Module Types

import type { Quadrant } from './index';

/** @deprecated kept for backward compat with persisted plans */
export type TaskPriority = 'A' | 'B' | 'C';

export interface DailyTask {
  id: string;
  text: string;
  estMinutes: number;
  quadrant?: Quadrant;
  /** @deprecated use quadrant */
  priority?: TaskPriority;
  completed: boolean;
  carriedForward: boolean;
}


export interface DailyPlan {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  tasks: DailyTask[];
  totalAvailableMinutes: number;
  bufferUsed: number; // percentage 0-100
  reflection?: string;
  createdAt: Date;
}

export interface WeeklyOutcome {
  id: string;
  text: string;
  linkedGoalId?: string;
  completed: boolean;
}

export interface WeeklyPlan {
  id: string;
  userId?: string;
  year: number;
  week: number; // 1-52
  wins: string[];
  lessons: string[];
  valuesAligned: boolean;
  priorities: string[];
  focusOutcomes: WeeklyOutcome[];
  q2Commitments: string[]; // Important + Not urgent tasks
  createdAt: Date;
}

export interface MonthlyOutcome {
  id: string;
  text: string;
  linkedGoalId?: string;
  completed: boolean;
}

export interface MonthlyPlan {
  id: string;
  userId?: string;
  year: number;
  month: number; // 1-12
  outcomes: MonthlyOutcome[];
  whatMatters: string;
  successCriteria: string;
  linkedGoals: string[];
  createdAt: Date;
}

export type SaversItemId = 'silence' | 'affirmations' | 'visualization' | 'exercise' | 'reading' | 'scribing';

export interface SaversItem {
  id: SaversItemId;
  label: string;
  emoji: string;
  enabled: boolean;
  durationMinutes: number;
  description: string;
}

export interface SaversProgress {
  date: string; // YYYY-MM-DD
  completedItems: SaversItemId[];
}

export const DEFAULT_SAVERS_CONFIG: SaversItem[] = [
  {
    id: 'silence',
    label: 'Silence',
    emoji: '🧘',
    enabled: true,
    durationMinutes: 10,
    description: 'Meditation, prayer, or quiet reflection',
  },
  {
    id: 'affirmations',
    label: 'Affirmations',
    emoji: '💪',
    enabled: true,
    durationMinutes: 5,
    description: 'Positive statements to program your mind',
  },
  {
    id: 'visualization',
    label: 'Visualization',
    emoji: '🎯',
    enabled: true,
    durationMinutes: 5,
    description: 'See yourself achieving your goals',
  },
  {
    id: 'exercise',
    label: 'Exercise',
    emoji: '🏃',
    enabled: true,
    durationMinutes: 20,
    description: 'Move your body to energize your mind',
  },
  {
    id: 'reading',
    label: 'Reading',
    emoji: '📚',
    enabled: true,
    durationMinutes: 20,
    description: 'Learn something new every day',
  },
  {
    id: 'scribing',
    label: 'Scribing',
    emoji: '✍️',
    enabled: true,
    durationMinutes: 10,
    description: 'Journal your thoughts and gratitude',
  },
];
