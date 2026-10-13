import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  AppStep, 
  MindDumpItem, 
  Task, 
  User, 
  Quadrant,
  WheelDomain,
  Goal,
  GoalHorizon,
} from '@/types';
import { 
  DailyPlan, 
  WeeklyPlan, 
  MonthlyPlan, 
  SaversItem, 
  SaversItemId,
  DEFAULT_SAVERS_CONFIG,
} from '@/types/planning';
import { DEFAULT_WHEEL_SCORES } from '@/data/wheel-domains';
import { supabase } from '@/integrations/supabase/client';
import {
  fetchMindDumpItems,
  saveMindDumpItem,
  deleteMindDumpItem as deleteDbMindDumpItem,
  fetchTasks,
  saveTask,
  deleteTask as deleteDbTask,
  fetchGoals,
  saveGoal,
  deleteGoal as deleteDbGoal,
  fetchWheelScores,
  saveWheelScores,
  fetchAlignmentData,
  saveAlignmentData,
  fetchPlans,
  savePlan,
  fetchSaversData,
  saveSaversData,
} from '@/services/cloudSync';

interface AppState {
  currentStep: AppStep;
  mindDumpItems: MindDumpItem[];
  tasks: Task[];
  user: Partial<User> | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  activeTriggers: string[];
  // Alignment state
  purposeAnswers: Record<string, string>;
  purposeStatement: string;
  selectedValues10: string[];
  selectedValues5: string[];
  rankedValues: string[];
  wheelScores: Record<WheelDomain, number>;
  goals: Goal[];
  // Planning state
  monthlyPlans: MonthlyPlan[];
  weeklyPlans: WeeklyPlan[];
  dailyPlans: DailyPlan[];
  saversConfig: SaversItem[];
  saversProgress: Record<string, SaversItemId[]>;
  customValues: string[];
  // Sync state
  isCloudSynced: boolean;
}

const INITIAL_STATE: AppState = {
  currentStep: 'onboarding-welcome',
  mindDumpItems: [],
  tasks: [],
  user: null,
  timerSeconds: 0,
  isTimerRunning: false,
  activeTriggers: [],
  purposeAnswers: {},
  purposeStatement: '',
  selectedValues10: [],
  selectedValues5: [],
  rankedValues: [],
  wheelScores: DEFAULT_WHEEL_SCORES,
  goals: [],
  monthlyPlans: [],
  weeklyPlans: [],
  dailyPlans: [],
  saversConfig: DEFAULT_SAVERS_CONFIG,
  saversProgress: {},
  customValues: ['', '', ''],
  isCloudSynced: false,
};

const STORAGE_KEY = 'minded-dump-state';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed, isCloudSynced: false };
      } catch {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const syncInProgress = useRef(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync with cloud when user is authenticated
  useEffect(() => {
    const syncWithCloud = async () => {
      if (syncInProgress.current) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      syncInProgress.current = true;

      try {
        // Fetch all data from cloud
        const [
          cloudItems,
          cloudTasks,
          cloudGoals,
          cloudWheelScores,
          cloudAlignment,
          cloudDailyPlans,
          cloudWeeklyPlans,
          cloudMonthlyPlans,
          cloudSaversData,
        ] = await Promise.all([
          fetchMindDumpItems(),
          fetchTasks(),
          fetchGoals(),
          fetchWheelScores(),
          fetchAlignmentData(),
          fetchPlans('daily'),
          fetchPlans('weekly'),
          fetchPlans('monthly'),
          fetchSaversData(),
        ]);

        setState(prev => ({
          ...prev,
          mindDumpItems: cloudItems.length > 0 ? cloudItems : prev.mindDumpItems,
          tasks: cloudTasks.length > 0 ? cloudTasks : prev.tasks,
          goals: cloudGoals.length > 0 ? cloudGoals : prev.goals,
          wheelScores: cloudWheelScores || prev.wheelScores,
          purposeAnswers: cloudAlignment?.purposeAnswers || prev.purposeAnswers,
          purposeStatement: cloudAlignment?.purposeStatement || prev.purposeStatement,
          selectedValues10: cloudAlignment?.selectedValues10 || prev.selectedValues10,
          selectedValues5: cloudAlignment?.selectedValues5 || prev.selectedValues5,
          rankedValues: cloudAlignment?.rankedValues || prev.rankedValues,
          dailyPlans: cloudDailyPlans as DailyPlan[] || prev.dailyPlans,
          weeklyPlans: cloudWeeklyPlans as WeeklyPlan[] || prev.weeklyPlans,
          monthlyPlans: cloudMonthlyPlans as MonthlyPlan[] || prev.monthlyPlans,
          saversConfig: cloudSaversData?.config || prev.saversConfig,
          saversProgress: cloudSaversData?.progress || prev.saversProgress,
          isCloudSynced: true,
          user: {
            ...prev.user,
            id: user.id,
            email: user.email || '',
            firstName: user.user_metadata?.first_name || prev.user?.firstName || '',
          },
        }));
      } catch (error) {
        console.error('Error syncing with cloud:', error);
      } finally {
        syncInProgress.current = false;
      }
    };

    syncWithCloud();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        syncWithCloud();
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({ ...prev, isCloudSynced: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setStep = useCallback((step: AppStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const addMindDumpItem = useCallback((text: string) => {
    const newItem: MindDumpItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date(),
      isActionable: null,
      status: 'active',
    };
    setState((prev) => ({
      ...prev,
      mindDumpItems: [...prev.mindDumpItems, newItem],
    }));
    
    // Sync to cloud
    saveMindDumpItem(newItem);
    
    return newItem;
  }, []);

  const updateMindDumpItem = useCallback((id: string, updates: Partial<MindDumpItem>) => {
    setState((prev) => {
      const updatedItems = prev.mindDumpItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      const updatedItem = updatedItems.find(item => item.id === id);
      if (updatedItem) {
        saveMindDumpItem(updatedItem);
      }
      return { ...prev, mindDumpItems: updatedItems };
    });
  }, []);

  const removeMindDumpItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      mindDumpItems: prev.mindDumpItems.filter((item) => item.id !== id),
    }));
    deleteDbMindDumpItem(id);
  }, []);

  const addTask = useCallback((text: string, quadrant: Quadrant) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      quadrant,
      estMinutes: 30,
      createdAt: new Date(),
    };
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
    saveTask(newTask);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((prev) => {
      const updatedTasks = prev.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      );
      const updatedTask = updatedTasks.find(task => task.id === id);
      if (updatedTask) {
        saveTask(updatedTask);
      }
      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
    deleteDbTask(id);
  }, []);

  const reorderTasks = useCallback((quadrant: Quadrant, activeId: string, overId: string) => {
    setState((prev) => {
      const tasks = [...prev.tasks];
      const activeIdx = tasks.findIndex((t) => t.id === activeId);
      const overIdx = tasks.findIndex((t) => t.id === overId);
      if (activeIdx === -1 || overIdx === -1) return prev;
      const [moved] = tasks.splice(activeIdx, 1);
      const newOverIdx = tasks.findIndex((t) => t.id === overId);
      tasks.splice(newOverIdx, 0, moved);
      return { ...prev, tasks };
    });
  }, []);


  const moveItemToTask = useCallback((itemId: string, quadrant: Quadrant) => {
    const item = state.mindDumpItems.find((i) => i.id === itemId);
    if (item) {
      addTask(item.text, quadrant);
      updateMindDumpItem(itemId, { status: 'archived' });
    }
  }, [state.mindDumpItems, addTask, updateMindDumpItem]);

  const setTimerSeconds = useCallback((seconds: number) => {
    setState((prev) => ({ ...prev, timerSeconds: seconds }));
  }, []);

  const setIsTimerRunning = useCallback((running: boolean) => {
    setState((prev) => ({ ...prev, isTimerRunning: running }));
  }, []);

  const toggleTrigger = useCallback((triggerId: string) => {
    setState((prev) => ({
      ...prev,
      activeTriggers: prev.activeTriggers.includes(triggerId)
        ? prev.activeTriggers.filter((id) => id !== triggerId)
        : [...prev.activeTriggers, triggerId],
    }));
  }, []);

  const setUser = useCallback((user: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...user },
    }));
  }, []);

  const resetApp = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  const getActiveItems = useCallback(() => {
    return state.mindDumpItems.filter((item) => item.status === 'active');
  }, [state.mindDumpItems]);

  const getUnsortedItems = useCallback(() => {
    return state.mindDumpItems.filter(
      (item) => item.status === 'active' && item.isActionable === null
    );
  }, [state.mindDumpItems]);

  const getActionableItems = useCallback(() => {
    return state.mindDumpItems.filter(
      (item) => item.status === 'active' && item.isActionable === true
    );
  }, [state.mindDumpItems]);

  const getTasksByQuadrant = useCallback((quadrant: Quadrant) => {
    return state.tasks.filter((task) => task.quadrant === quadrant);
  }, [state.tasks]);

  const getTotalTimeByQuadrant = useCallback((quadrant: Quadrant) => {
    return state.tasks
      .filter((task) => task.quadrant === quadrant)
      .reduce((sum, task) => sum + task.estMinutes, 0);
  }, [state.tasks]);

  // ============ ALIGNMENT ACTIONS ============

  const setPurposeAnswer = useCallback((questionId: string, answer: string) => {
    setState((prev) => {
      const newAnswers = { ...prev.purposeAnswers, [questionId]: answer };
      saveAlignmentData({ purposeAnswers: newAnswers });
      return { ...prev, purposeAnswers: newAnswers };
    });
  }, []);

  const setPurposeStatement = useCallback((text: string) => {
    setState((prev) => {
      saveAlignmentData({ purposeStatement: text });
      return { ...prev, purposeStatement: text };
    });
  }, []);

  const setSelectedValues10 = useCallback((values: string[]) => {
    setState((prev) => {
      saveAlignmentData({ selectedValues10: values });
      return { ...prev, selectedValues10: values };
    });
  }, []);

  const setSelectedValues5 = useCallback((values: string[]) => {
    setState((prev) => {
      saveAlignmentData({ selectedValues5: values });
      return { ...prev, selectedValues5: values };
    });
  }, []);

  const setRankedValues = useCallback((values: string[]) => {
    setState((prev) => {
      saveAlignmentData({ rankedValues: values });
      return { ...prev, rankedValues: values };
    });
  }, []);

  const setCustomValues = useCallback((values: string[]) => {
    setState((prev) => ({ ...prev, customValues: values }));
  }, []);

  const setWheelScore = useCallback((domain: WheelDomain, score: number) => {
    setState((prev) => {
      const newScores = { ...prev.wheelScores, [domain]: score };
      saveWheelScores(newScores);
      return { ...prev, wheelScores: newScores };
    });
  }, []);

  const getLowestWheelDomains = useCallback((threshold: number = 6): WheelDomain[] => {
    return (Object.entries(state.wheelScores) as [WheelDomain, number][])
      .filter(([_, score]) => score < threshold)
      .sort((a, b) => a[1] - b[1])
      .map(([domain]) => domain);
  }, [state.wheelScores]);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    saveGoal(newGoal);
    return newGoal;
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setState((prev) => {
      const updatedGoals = prev.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      );
      const updatedGoal = updatedGoals.find(goal => goal.id === id);
      if (updatedGoal) {
        saveGoal(updatedGoal);
      }
      return { ...prev, goals: updatedGoals };
    });
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal.id !== id),
    }));
    deleteDbGoal(id);
  }, []);

  const getGoalsByDomain = useCallback((domain: WheelDomain) => {
    return state.goals.filter((goal) => goal.domain === domain);
  }, [state.goals]);

  const getGoalsByHorizon = useCallback((horizon: GoalHorizon) => {
    return state.goals.filter((goal) => goal.horizon === horizon);
  }, [state.goals]);

  // ============ PLANNING ACTIONS ============

  const addMonthlyPlan = useCallback((plan: Omit<MonthlyPlan, 'id' | 'createdAt'>) => {
    const newPlan: MonthlyPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setState((prev) => ({
      ...prev,
      monthlyPlans: [...prev.monthlyPlans, newPlan],
    }));
    savePlan('monthly', `${plan.year}-${plan.month}`, newPlan);
    return newPlan;
  }, []);

  const updateMonthlyPlan = useCallback((id: string, updates: Partial<MonthlyPlan>) => {
    setState((prev) => {
      const updatedPlans = prev.monthlyPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      );
      const updatedPlan = updatedPlans.find(plan => plan.id === id);
      if (updatedPlan) {
        savePlan('monthly', `${updatedPlan.year}-${updatedPlan.month}`, updatedPlan);
      }
      return { ...prev, monthlyPlans: updatedPlans };
    });
  }, []);

  const getMonthlyPlan = useCallback((year: number, month: number) => {
    return state.monthlyPlans.find((p) => p.year === year && p.month === month);
  }, [state.monthlyPlans]);

  const addWeeklyPlan = useCallback((plan: Omit<WeeklyPlan, 'id' | 'createdAt'>) => {
    const newPlan: WeeklyPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setState((prev) => ({
      ...prev,
      weeklyPlans: [...prev.weeklyPlans, newPlan],
    }));
    savePlan('weekly', `${plan.year}-W${plan.week}`, newPlan);
    return newPlan;
  }, []);

  const updateWeeklyPlan = useCallback((id: string, updates: Partial<WeeklyPlan>) => {
    setState((prev) => {
      const updatedPlans = prev.weeklyPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      );
      const updatedPlan = updatedPlans.find(plan => plan.id === id);
      if (updatedPlan) {
        savePlan('weekly', `${updatedPlan.year}-W${updatedPlan.week}`, updatedPlan);
      }
      return { ...prev, weeklyPlans: updatedPlans };
    });
  }, []);

  const getWeeklyPlan = useCallback((year: number, week: number) => {
    return state.weeklyPlans.find((p) => p.year === year && p.week === week);
  }, [state.weeklyPlans]);

  const addDailyPlan = useCallback((plan: Omit<DailyPlan, 'id' | 'createdAt'>) => {
    const newPlan: DailyPlan = {
      ...plan,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setState((prev) => ({
      ...prev,
      dailyPlans: [...prev.dailyPlans, newPlan],
    }));
    savePlan('daily', plan.date, newPlan);
    return newPlan;
  }, []);

  const updateDailyPlan = useCallback((id: string, updates: Partial<DailyPlan>) => {
    setState((prev) => {
      const updatedPlans = prev.dailyPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updates } : plan
      );
      const updatedPlan = updatedPlans.find(plan => plan.id === id);
      if (updatedPlan) {
        savePlan('daily', updatedPlan.date, updatedPlan);
      }
      return { ...prev, dailyPlans: updatedPlans };
    });
  }, []);

  const getDailyPlan = useCallback((date: string) => {
    return state.dailyPlans.find((p) => p.date === date);
  }, [state.dailyPlans]);

  // SAVERS actions
  const updateSaversConfig = useCallback((itemId: SaversItemId, updates: Partial<SaversItem>) => {
    setState((prev) => {
      const newConfig = prev.saversConfig.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      saveSaversData(newConfig, prev.saversProgress);
      return { ...prev, saversConfig: newConfig };
    });
  }, []);

  const toggleSaversItem = useCallback((date: string, itemId: SaversItemId) => {
    setState((prev) => {
      const currentItems = prev.saversProgress[date] || [];
      const newItems = currentItems.includes(itemId)
        ? currentItems.filter((id) => id !== itemId)
        : [...currentItems, itemId];
      const newProgress = { ...prev.saversProgress, [date]: newItems };
      saveSaversData(prev.saversConfig, newProgress);
      return { ...prev, saversProgress: newProgress };
    });
  }, []);

  const getSaversProgress = useCallback((date: string) => {
    return state.saversProgress[date] || [];
  }, [state.saversProgress]);

  return {
    ...state,
    setStep,
    addMindDumpItem,
    updateMindDumpItem,
    removeMindDumpItem,
    addTask,
    updateTask,
    removeTask,
    reorderTasks,
    moveItemToTask,

    setTimerSeconds,
    setIsTimerRunning,
    toggleTrigger,
    setUser,
    resetApp,
    getActiveItems,
    getUnsortedItems,
    getActionableItems,
    getTasksByQuadrant,
    getTotalTimeByQuadrant,
    // Alignment actions
    setPurposeAnswer,
    setPurposeStatement,
    setSelectedValues10,
    setSelectedValues5,
    setRankedValues,
    setCustomValues,
    setWheelScore,
    getLowestWheelDomains,
    addGoal,
    updateGoal,
    removeGoal,
    getGoalsByDomain,
    getGoalsByHorizon,
    // Planning actions
    addMonthlyPlan,
    updateMonthlyPlan,
    getMonthlyPlan,
    addWeeklyPlan,
    updateWeeklyPlan,
    getWeeklyPlan,
    addDailyPlan,
    updateDailyPlan,
    getDailyPlan,
    updateSaversConfig,
    toggleSaversItem,
    getSaversProgress,
  };
}
