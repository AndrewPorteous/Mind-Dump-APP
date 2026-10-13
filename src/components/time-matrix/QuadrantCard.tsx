import { Task, QuadrantInfo, Quadrant } from '@/types';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Info, X, MoreVertical, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';
import { useState } from 'react';

interface TaskItemProps {
  task: Task;
  onUpdateTime: (id: string, minutes: number) => void;
  onDelete: (id: string) => void;
  onMoveToQuadrant?: (id: string, quadrant: Quadrant) => void;
}

function TaskItem({ task, onUpdateTime, onDelete, onMoveToQuadrant }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const { impact } = useHaptic();
  const [showActions, setShowActions] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleLongPress = () => {
    impact('medium');
    setShowActions(true);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'task-item flex items-center gap-2 group',
          isDragging && 'opacity-50'
        )}
        {...attributes}
        {...listeners}
      >
        <span className="flex-1 truncate text-sm">{task.text}</span>
        <div className="flex items-center gap-1">
          <select
            value={task.estMinutes}
            onChange={(e) => onUpdateTime(task.id, parseInt(e.target.value))}
            className="text-xs bg-transparent border-0 text-muted-foreground cursor-pointer w-12"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={15}>15m</option>
            <option value={30}>30m</option>
            <option value={45}>45m</option>
            <option value={60}>1h</option>
            <option value={90}>1.5h</option>
            <option value={120}>2h</option>
          </select>
          <button
            onClick={(e) => {
              e.stopPropagation();
              impact('light');
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive active:bg-destructive/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

const QUADRANT_STYLES: Record<string, { border: string; accent: string; number: string }> = {
  Q1: { border: 'border-l-red-500', accent: 'bg-red-500/10', number: 'text-red-500' },
  Q2: { border: 'border-l-green-500', accent: 'bg-green-500/10', number: 'text-green-500' },
  Q3: { border: 'border-l-amber-500', accent: 'bg-amber-500/10', number: 'text-amber-500' },
  Q4: { border: 'border-l-gray-400', accent: 'bg-gray-400/10', number: 'text-gray-400' },
};

interface QuadrantCardProps {
  quadrant: QuadrantInfo;
  tasks: Task[];
  totalTime: number;
  onUpdateTime: (id: string, minutes: number) => void;
  onDelete: (id: string) => void;
  onShowInfo: () => void;
}

export function QuadrantCard({ 
  quadrant, 
  tasks, 
  totalTime, 
  onUpdateTime, 
  onDelete,
  onShowInfo,
}: QuadrantCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const styles = QUADRANT_STYLES[quadrant.id];
  const quadrantNumber = quadrant.id.replace('Q', '');

  return (
    <div className={cn(
      'bg-card rounded-2xl border border-l-4 p-4 flex flex-col h-full min-h-[180px]',
      styles.border
    )}
    style={{ boxShadow: 'var(--zen-shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('text-xl font-bold', styles.number)}>{quadrantNumber}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{quadrant.title}</h3>
            <p className="text-[11px] text-muted-foreground">{quadrant.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onShowInfo}
          className="p-1.5 text-muted-foreground active:bg-muted/50 rounded-lg transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed line-clamp-2">
        {quadrant.description}
      </p>

      {/* Tasks */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-1.5 min-h-[40px]">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdateTime={onUpdateTime}
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-xs text-muted-foreground/40 italic py-2">
              Drag tasks here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-border/30 space-y-2">
        {quadrant.action && (
          quadrant.action.includes('·') ? (
            <div className="flex flex-wrap gap-1">
              {quadrant.action.split('·').map((opt) => (
                <span
                  key={opt}
                  className={cn('text-[10px] font-semibold px-2 py-1 rounded-md', styles.accent)}
                >
                  {opt.trim()}
                </span>
              ))}
            </div>
          ) : (
            <div className={cn('text-[11px] font-medium px-2.5 py-1.5 rounded-lg', styles.accent)}>
              {quadrant.action}
            </div>
          )
        )}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          {quadrant.rule && <span>{quadrant.rule}</span>}
          {tasks.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{formatTime(totalTime)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
