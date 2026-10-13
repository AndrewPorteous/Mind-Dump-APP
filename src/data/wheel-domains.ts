import { WheelDomainInfo, WheelDomain } from '@/types/alignment';

export const WHEEL_DOMAINS: WheelDomainInfo[] = [
  {
    id: 'physical',
    label: 'Physical Environment',
    emoji: '🏠',
    description: 'Your home, workspace, and surroundings',
  },
  {
    id: 'career',
    label: 'Business/Career',
    emoji: '💼',
    description: 'Your work, profession, and professional growth',
  },
  {
    id: 'finances',
    label: 'Finances',
    emoji: '💰',
    description: 'Your financial security and money management',
  },
  {
    id: 'health',
    label: 'Health',
    emoji: '💚',
    description: 'Your physical and mental wellbeing',
  },
  {
    id: 'family',
    label: 'Family & Friends',
    emoji: '👨‍👩‍👧',
    description: 'Your relationships with loved ones',
  },
  {
    id: 'romance',
    label: 'Romance',
    emoji: '💕',
    description: 'Your romantic relationship and intimacy',
  },
  {
    id: 'growth',
    label: 'Personal Growth',
    emoji: '📚',
    description: 'Your learning, self-improvement, and spirituality',
  },
  {
    id: 'fun',
    label: 'Fun & Recreation',
    emoji: '🎉',
    description: 'Your hobbies, leisure, and enjoyment',
  },
];

export const WHEEL_DOMAIN_COLORS: Record<WheelDomain, string> = {
  physical: 'hsl(var(--wheel-physical))',
  career: 'hsl(var(--wheel-career))',
  finances: 'hsl(var(--wheel-finances))',
  health: 'hsl(var(--wheel-health))',
  family: 'hsl(var(--wheel-family))',
  romance: 'hsl(var(--wheel-romance))',
  growth: 'hsl(var(--wheel-growth))',
  fun: 'hsl(var(--wheel-fun))',
};

export const DEFAULT_WHEEL_SCORES: Record<WheelDomain, number> = {
  physical: 5,
  career: 5,
  finances: 5,
  health: 5,
  family: 5,
  romance: 5,
  growth: 5,
  fun: 5,
};
