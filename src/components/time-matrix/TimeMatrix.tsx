import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { QUADRANTS, Quadrant, Task } from '@/types';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowLeft, ArrowRight, Play, X } from 'lucide-react';
import { QuadrantCard } from './QuadrantCard';
import { ParetoSection } from './ParetoSection';
import { TimeWarnings } from './TimeWarnings';
import { BottomSheet } from '@/components/ui/BottomSheet';

export function TimeMatrix() {
  const {
    setStep,
    tasks,
    getTasksByQuadrant,
    getTotalTimeByQuadrant,
    updateTask,
    removeTask,
    reorderTasks,
  } = useApp();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showInfo, setShowInfo] = useState<Quadrant | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const quadrantIds: Quadrant[] = ['Q1', 'Q2', 'Q3', 'Q4'];
    const activeTaskObj = tasks.find((t) => t.id === active.id);
    if (!activeTaskObj) return;
    if (quadrantIds.includes(over.id as Quadrant)) {
      updateTask(active.id as string, { quadrant: over.id as Quadrant });
      return;
    }
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && overTask.quadrant === activeTaskObj.quadrant) {
      reorderTasks(activeTaskObj.quadrant, active.id as string, over.id as string);
    } else if (overTask) {
      updateTask(active.id as string, { quadrant: overTask.quadrant });
    }
  };

  const handleUpdateTime = (id: string, minutes: number) => {
    updateTask(id, { estMinutes: minutes });
  };

  const handleDeleteTask = (id: string) => {
    removeTask(id);
  };

  const infoQuadrant = QUADRANTS.find((q) => q.id === showInfo);
  const q2Time = getTotalTimeByQuadrant('Q2');
  const q3Time = getTotalTimeByQuadrant('Q3');

  const orderedQuadrants = [
    QUADRANTS.find(q => q.id === 'Q1')!,
    QUADRANTS.find(q => q.id === 'Q2')!,
    QUADRANTS.find(q => q.id === 'Q3')!,
    QUADRANTS.find(q => q.id === 'Q4')!,
  ];

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="pt-4 pb-3 animate-fade-in">
        <button
          onClick={() => setStep('mind-dump-sort')}
          className="flex items-center gap-1 text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to sorting</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Time Matrix</h1>
          <button className="flex items-center gap-1 text-xs text-muted-foreground opacity-50 cursor-default" disabled>
            <Play className="w-3.5 h-3.5" />
            Guide (soon)
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Prioritize with the Eisenhower method
        </p>
      </div>

      {/* Axis Labels */}
      <div className="flex justify-center gap-6 mb-3 text-xs font-medium text-muted-foreground animate-fade-in">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-quadrant-q2 rounded-full" />
          IMPORTANT
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-quadrant-q1 rounded-full" />
          URGENT
        </span>
      </div>

      <TimeWarnings q2Time={q2Time} q3Time={q3Time} />

      {/* Matrix Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 animate-slide-up">
          {orderedQuadrants.map((quadrant) => (
            <QuadrantCard
              key={quadrant.id}
              quadrant={quadrant}
              tasks={getTasksByQuadrant(quadrant.id)}
              totalTime={getTotalTimeByQuadrant(quadrant.id)}
              onUpdateTime={handleUpdateTime}
              onDelete={handleDeleteTask}
              onShowInfo={() => setShowInfo(quadrant.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="task-item bg-card px-3 py-2.5 rounded-xl border border-border/30" style={{ boxShadow: 'var(--zen-shadow-lg)' }}>
              {activeTask.text}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <ParetoSection />

      {/* Info Bottom Sheet */}
      <BottomSheet
        open={!!showInfo && !!infoQuadrant}
        onClose={() => setShowInfo(null)}
        title={infoQuadrant?.title}
      >
        {infoQuadrant && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{infoQuadrant.subtitle}</p>
            <p className="text-foreground">{infoQuadrant.description}</p>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Examples:</p>
              <ul className="space-y-2">
                {infoQuadrant.examples.map((example) => (
                  <li key={example} className="text-sm text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>

            {infoQuadrant.action && (
              <div className="bg-primary/10 rounded-xl px-4 py-3 text-sm text-primary font-medium">
                {infoQuadrant.action}
              </div>
            )}

            {infoQuadrant.rule && (
              <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground">
                {infoQuadrant.rule}
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Continue */}
      <div className="py-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ZenButton onClick={() => setStep('clarity-check')}>
          Continue
        </ZenButton>
      </div>
    </div>
  );
}
