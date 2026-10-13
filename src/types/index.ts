// The Alchemist Path — Mind Dump data types

export type ItemStatus = 'active' | 'archived' | 'discarded' | 'reference';
export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type PaymentStatus = 'free' | 'paid';

export interface User {
  id: string;
  firstName: string;
  email: string;
  emailVerified: boolean;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface MindDumpItem {
  id: string;
  userId?: string;
  text: string;
  createdAt: Date;
  isActionable: boolean | null;
  status: ItemStatus;
}

export interface Task {
  id: string;
  userId?: string;
  text: string;
  quadrant: Quadrant;
  estMinutes: number;
  createdAt: Date;
}

export type TriggerCategory = 
  | 'work' 
  | 'personal' 
  | 'health' 
  | 'money' 
  | 'relationships' 
  | 'worries' 
  | 'ideas'
  | 'goals'
  | 'projects';

export interface Trigger {
  id: TriggerCategory;
  label: string;
  emoji: string;
}

export const TRIGGERS: Trigger[] = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'personal', label: 'Personal', emoji: '🏠' },
  { id: 'health', label: 'Health', emoji: '💚' },
  { id: 'money', label: 'Money', emoji: '💰' },
  { id: 'relationships', label: 'Relationships', emoji: '💬' },
  { id: 'worries', label: 'Worries', emoji: '☁️' },
  { id: 'ideas', label: 'Ideas', emoji: '💡' },
  { id: 'goals', label: 'Goals', emoji: '🎯' },
  { id: 'projects', label: 'Projects', emoji: '📁' },
];

export interface QuadrantInfo {
  id: Quadrant;
  title: string;
  subtitle: string;
  description: string;
  examples: string[];
  action?: string;
  rule?: string;
}

export const QUADRANTS: QuadrantInfo[] = [
  {
    id: 'Q1',
    title: 'Do it Now',
    subtitle: 'Urgent + Important',
    description: 'Crises, Pressing Problems, Deadline Driven Projects.',
    examples: ['Urgent deadlines', 'Health emergencies', 'Critical client issues', 'Last-minute crises'],
    action: 'Order your Q1 activities.',
    rule: "Without priorities, you're always putting out fires.",
  },
  {
    id: 'Q2',
    title: 'Schedule',
    subtitle: 'Important + Not Urgent',
    description: 'Prevention, PC activities, Relationship Building, Recognizing new Opportunities, Planning, Recreation.',
    examples: ['Exercise', 'Learning', 'Relationship building', 'Strategic planning', 'Prevention'],
    action: 'Find a Date and Follow through',
    rule: 'Min. 2 hours a day planned as general rule',
  },
  {
    id: 'Q3',
    title: 'Delegate',
    subtitle: 'Urgent + Not Important',
    description: 'Interruptions, some calls, some mail, some reports, some meetings, pressing matters, popular activities.',
    examples: ['Some emails', 'Some meetings', 'Interruptions', 'Some phone calls'],
    action: 'Batch · Shorten · Delegate · Postpone · File',
    rule: 'Max. 30-45 minutes per day as general rule',
  },
  {
    id: 'Q4',
    title: 'Eliminate',
    subtitle: 'Not Urgent + Not Important',
    description: 'Trivia, busy work, some mail, some phone calls, Time wasters, pleasant activities.',
    examples: ['Mindless scrolling', 'Excessive TV', 'Trivial busywork', 'Time wasters'],
    action: 'Discard / File / Simply do not do it',
    rule: 'If you still want it, check — it might be a Q2.',
  },
];


export type AppStep = 
  | 'onboarding-welcome'
  | 'welcome'
  | 'onboarding-how'
  | 'onboarding-commitment'
  | 'mind-dump'
  | 'mind-dump-sort'
  | 'time-matrix-intro'
  | 'time-matrix'
  | 'clarity-check'
  | 'save-progress'
  | 'email-consent'
  | 'paywall'
  | 'dashboard'
  | 'settings'
  | 'learn-system'
  | 'premium-overview'
  // Purpose module
  | 'purpose-intro'
  | 'purpose-questions'
  | 'purpose-summary'
  // Values module
  | 'values-select'
  | 'values-narrow'
  | 'values-rank'
  // Wheel module
  | 'wheel-intro'
  | 'wheel-scores'
  | 'wheel-chart'
  // Goals module
  | 'goals-intro'
  | 'goals-create'
  | 'goals-summary'
  // Planning module
  | 'planning-monthly'
  | 'planning-weekly'
  | 'planning-daily'
  // SAVERS routine
  | 'savers-setup'
  | 'savers-daily';

export interface EmailPreferences {
  tipsOptedIn: boolean;
  frequency: 24 | 48 | 168; // hours
}

// Re-export alignment and planning types
export * from './alignment';
export * from './planning';
