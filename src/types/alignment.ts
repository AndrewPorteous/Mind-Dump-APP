// Alignment Module Types

export type WheelDomain = 
  | 'physical'
  | 'career'
  | 'finances'
  | 'health'
  | 'family'
  | 'romance'
  | 'growth'
  | 'fun';

export type GoalHorizon = '3months' | '12months' | '3-5years';

export interface Value {
  id: string;
  label: string;
}

export interface WheelDomainInfo {
  id: WheelDomain;
  label: string;
  emoji: string;
  description: string;
}

export interface WheelScore {
  domain: WheelDomain;
  score: number;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId?: string;
  domain: WheelDomain;
  title: string;
  why: string;
  targetDate?: Date;
  horizon: GoalHorizon;
  linkedValues: string[];
  linkedPurpose: boolean;
  createdAt: Date;
  completed: boolean;
}

export interface PurposeStatement {
  text: string;
  updatedAt: Date;
}

export interface PurposeQuestion {
  id: string;
  question: string;
  explanation: string;
  placeholder: string;
}

