import { supabase } from '@/integrations/supabase/client';
import { MindDumpItem, Task, Quadrant, Goal, WheelDomain } from '@/types';
import { DailyPlan, WeeklyPlan, MonthlyPlan, SaversItem, SaversItemId } from '@/types/planning';
import { Json } from '@/integrations/supabase/types';

// Type definitions for database operations
type DbMindDumpItem = {
  id: string;
  user_id: string;
  text: string;
  is_actionable: boolean | null;
  status: string;
  created_at: string;
};

type DbTask = {
  id: string;
  user_id: string;
  text: string;
  quadrant: string;
  est_minutes: number;
  created_at: string;
};

type DbGoal = {
  id: string;
  user_id: string;
  domain: string;
  title: string;
  why: string | null;
  horizon: string;
  completed: boolean;
  created_at: string;
};

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

// ============ MIND DUMP ITEMS ============

export async function fetchMindDumpItems(): Promise<MindDumpItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('mind_dump_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching mind dump items:', error);
    return [];
  }

  return (data || []).map((item: DbMindDumpItem) => ({
    id: item.id,
    text: item.text,
    isActionable: item.is_actionable,
    status: item.status as MindDumpItem['status'],
    createdAt: new Date(item.created_at),
  }));
}

export async function saveMindDumpItem(item: MindDumpItem): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('mind_dump_items')
    .upsert({
      id: item.id,
      user_id: userId,
      text: item.text,
      is_actionable: item.isActionable,
      status: item.status,
    });

  if (error) console.error('Error saving mind dump item:', error);
}

export async function deleteMindDumpItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('mind_dump_items')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting mind dump item:', error);
}

// ============ TASKS ============

export async function fetchTasks(): Promise<Task[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map((task: DbTask) => ({
    id: task.id,
    text: task.text,
    quadrant: task.quadrant as Quadrant,
    estMinutes: task.est_minutes,
    createdAt: new Date(task.created_at),
  }));
}

export async function saveTask(task: Task): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('tasks')
    .upsert({
      id: task.id,
      user_id: userId,
      text: task.text,
      quadrant: task.quadrant,
      est_minutes: task.estMinutes,
    });

  if (error) console.error('Error saving task:', error);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting task:', error);
}

// ============ GOALS ============

export async function fetchGoals(): Promise<Goal[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  return (data || []).map((goal: DbGoal) => ({
    id: goal.id,
    domain: goal.domain as WheelDomain,
    title: goal.title,
    why: goal.why || '',
    horizon: goal.horizon as Goal['horizon'],
    completed: goal.completed,
    createdAt: new Date(goal.created_at),
    linkedValues: [],
    linkedPurpose: false,
  }));
}

export async function saveGoal(goal: Goal): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('goals')
    .upsert({
      id: goal.id,
      user_id: userId,
      domain: goal.domain,
      title: goal.title,
      why: goal.why || null,
      horizon: goal.horizon,
      completed: goal.completed,
    });

  if (error) console.error('Error saving goal:', error);
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting goal:', error);
}

// ============ WHEEL SCORES ============

export async function fetchWheelScores(): Promise<Record<WheelDomain, number> | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('wheel_scores')
    .select('scores')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching wheel scores:', error);
    return null;
  }

  return data?.scores as Record<WheelDomain, number> | null;
}

export async function saveWheelScores(scores: Record<WheelDomain, number>): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Check if record exists
  const { data: existing } = await supabase
    .from('wheel_scores')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('wheel_scores')
      .update({
        scores: scores as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) console.error('Error updating wheel scores:', error);
  } else {
    const { error } = await supabase
      .from('wheel_scores')
      .insert({
        user_id: userId,
        scores: scores as unknown as Json,
      });
    if (error) console.error('Error inserting wheel scores:', error);
  }
}

// ============ ALIGNMENT DATA (Purpose & Values) ============

export async function fetchAlignmentData(): Promise<{
  purposeAnswers: Record<string, string>;
  purposeStatement: string;
  selectedValues10: string[];
  selectedValues5: string[];
  rankedValues: string[];
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('alignment_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching alignment data:', error);
    return null;
  }

  if (!data) return null;

  return {
    purposeAnswers: (data.purpose_answers as Record<string, string>) || {},
    purposeStatement: data.purpose_statement || '',
    selectedValues10: data.selected_values_10 || [],
    selectedValues5: data.selected_values_5 || [],
    rankedValues: data.ranked_values || [],
  };
}

export async function saveAlignmentData(alignmentData: {
  purposeAnswers?: Record<string, string>;
  purposeStatement?: string;
  selectedValues10?: string[];
  selectedValues5?: string[];
  rankedValues?: string[];
}): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Check if record exists
  const { data: existing } = await supabase
    .from('alignment_data')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const updateFields: Record<string, unknown> = {};
  
  if (alignmentData.purposeAnswers !== undefined) {
    updateFields.purpose_answers = alignmentData.purposeAnswers;
  }
  if (alignmentData.purposeStatement !== undefined) {
    updateFields.purpose_statement = alignmentData.purposeStatement;
  }
  if (alignmentData.selectedValues10 !== undefined) {
    updateFields.selected_values_10 = alignmentData.selectedValues10;
  }
  if (alignmentData.selectedValues5 !== undefined) {
    updateFields.selected_values_5 = alignmentData.selectedValues5;
  }
  if (alignmentData.rankedValues !== undefined) {
    updateFields.ranked_values = alignmentData.rankedValues;
  }

  if (existing) {
    const { error } = await supabase
      .from('alignment_data')
      .update({
        ...updateFields,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) console.error('Error updating alignment data:', error);
  } else {
    const { error } = await supabase
      .from('alignment_data')
      .insert({
        user_id: userId,
        ...updateFields,
      });
    if (error) console.error('Error inserting alignment data:', error);
  }
}

// ============ PLANS ============

type PlanData = DailyPlan | WeeklyPlan | MonthlyPlan;

export async function fetchPlans(planType: 'daily' | 'weekly' | 'monthly'): Promise<PlanData[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_type', planType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  return (data || []).map((plan) => {
    const planData = plan.data as Record<string, unknown>;
    return {
      id: plan.id,
      createdAt: new Date(plan.created_at),
      ...planData,
    } as PlanData;
  });
}

export async function savePlan(
  planType: 'daily' | 'weekly' | 'monthly',
  planDate: string,
  planData: PlanData
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Check if plan exists
  const { data: existing } = await supabase
    .from('plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_type', planType)
    .eq('plan_date', planDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('plans')
      .update({
        data: planData as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) console.error('Error updating plan:', error);
  } else {
    const { error } = await supabase
      .from('plans')
      .insert({
        user_id: userId,
        plan_type: planType,
        plan_date: planDate,
        data: planData as unknown as Json,
      });
    if (error) console.error('Error inserting plan:', error);
  }
}

// ============ SAVERS DATA ============

export async function fetchSaversData(): Promise<{
  config: SaversItem[];
  progress: Record<string, SaversItemId[]>;
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('savers_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching savers data:', error);
    return null;
  }

  if (!data) return null;

  return {
    config: data.config as unknown as SaversItem[],
    progress: data.progress as unknown as Record<string, SaversItemId[]>,
  };
}

export async function saveSaversData(
  config: SaversItem[],
  progress: Record<string, SaversItemId[]>
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Check if record exists
  const { data: existing } = await supabase
    .from('savers_data')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('savers_data')
      .update({
        config: config as unknown as Json,
        progress: progress as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) console.error('Error updating savers data:', error);
  } else {
    const { error } = await supabase
      .from('savers_data')
      .insert({
        user_id: userId,
        config: config as unknown as Json,
        progress: progress as unknown as Json,
      });
    if (error) console.error('Error inserting savers data:', error);
  }
}

// ============ USER PREFERENCES ============

export async function fetchUserPreferences(): Promise<{ tipsOptedIn: boolean } | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('tips_opted_in')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }

  if (!data) return null;
  return { tipsOptedIn: data.tips_opted_in };
}

export async function saveUserPreferences(tipsOptedIn: boolean): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('user_preferences')
      .update({
        tips_opted_in: tipsOptedIn,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) console.error('Error updating user preferences:', error);
  } else {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        tips_opted_in: tipsOptedIn,
      });
    if (error) console.error('Error inserting user preferences:', error);
  }
}
