import { Quadrant, TriggerCategory } from '@/types';

export interface MetalStage {
  id: 'lead' | 'iron' | 'steel' | 'copper' | 'silver' | 'gold' | 'palladium';
  name: string;
  meaning: string;
  /** Thoughts captured needed to reach this stage. */
  threshold: number;
  colorVar: string;
}

/** The seven metals of the path, used to reward a fuller mind dump. */
export const METAL_STAGES: MetalStage[] = [
  { id: 'lead', name: 'Lead', meaning: 'Awareness', threshold: 1, colorVar: '--metal-lead' },
  { id: 'iron', name: 'Iron', meaning: 'Stability', threshold: 4, colorVar: '--metal-iron' },
  { id: 'steel', name: 'Steel', meaning: 'Security', threshold: 8, colorVar: '--metal-steel' },
  { id: 'copper', name: 'Copper', meaning: 'Comfort', threshold: 12, colorVar: '--metal-copper' },
  { id: 'silver', name: 'Silver', meaning: 'Independence', threshold: 17, colorVar: '--metal-silver' },
  { id: 'gold', name: 'Gold', meaning: 'Freedom', threshold: 23, colorVar: '--metal-gold' },
  { id: 'palladium', name: 'Palladium', meaning: 'Mastery', threshold: 30, colorVar: '--metal-palladium' },
];

export function getMetalProgress(count: number) {
  let index = -1;
  METAL_STAGES.forEach((stage, i) => {
    if (count >= stage.threshold) index = i;
  });
  const current = index >= 0 ? METAL_STAGES[index] : null;
  const next = METAL_STAGES[index + 1] ?? null;
  const floor = current?.threshold ?? 0;
  const progress = next ? (count - floor) / (next.threshold - floor) : 1;
  return { index, current, next, progress: Math.max(0, Math.min(1, progress)) };
}

/** Gentle questions to help beginners keep going when the mind goes blank. */
export const TRIGGER_PROMPTS: Record<TriggerCategory | 'general', string[]> = {
  general: [
    "What's been nagging at you this week?",
    'What did you promise someone and not do yet?',
    'What would you love to stop thinking about?',
    'What is waiting for a reply?',
    'What keeps you awake at night?',
  ],
  work: ['Which email or message needs an answer?', 'What deadline is coming up?', 'Which meeting needs preparing?'],
  personal: ['What needs fixing at home?', 'Any errands or appointments to book?', 'What paperwork is pending?'],
  health: ['When did you last move your body?', 'Any check-up you keep postponing?', 'How are you sleeping?'],
  money: ['Any bill to pay or subscription to cancel?', 'What purchase are you weighing up?', 'Is your budget up to date?'],
  relationships: ['Who would you like to call back?', 'Any birthday or event coming up?', 'Is there a conversation you are avoiding?'],
  worries: ['What are you afraid might go wrong?', 'What feels out of your control?', 'What are you overthinking right now?'],
  ideas: ['What idea keeps coming back?', 'What would you build with a free weekend?', 'What do you want to learn?'],
  goals: ['Which goal needs a next step?', 'What would make this month a win?', 'Where do you want to be in a year?'],
  projects: ['Which project is stuck?', 'What is the very next action on it?', 'What could you hand off?'],
};

export const QUADRANT_STYLE: Record<Quadrant, { text: string; bg: string; border: string; metal: string; verb: string }> = {
  Q1: { text: 'text-quadrant-q1', bg: 'bg-quadrant-q1/10', border: 'border-quadrant-q1/50', metal: 'Copper fire', verb: 'Do it now' },
  Q2: { text: 'text-quadrant-q2', bg: 'bg-quadrant-q2/10', border: 'border-quadrant-q2/50', metal: 'Gold', verb: 'Schedule it' },
  Q3: { text: 'text-quadrant-q3', bg: 'bg-quadrant-q3/10', border: 'border-quadrant-q3/50', metal: 'Steel', verb: 'Delegate it' },
  Q4: { text: 'text-quadrant-q4', bg: 'bg-quadrant-q4/10', border: 'border-quadrant-q4/50', metal: 'Lead', verb: 'Drop it' },
};

export function quadrantFromAnswers(important: boolean, urgent: boolean): Quadrant {
  if (important && urgent) return 'Q1';
  if (important) return 'Q2';
  if (urgent) return 'Q3';
  return 'Q4';
}

/** localStorage helpers that never throw (private mode, quota, etc.). */
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal(key: string, value: unknown) {
  try {
    if (value === null || value === undefined || value === '') localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — draft just won't persist */
  }
}
