import { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { ArrowLeft, GripVertical } from 'lucide-react';
import { getValueLabel } from '@/data/values-list';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableValueItemProps {
  id: string;
  rank: number;
  customValues: string[];
}

function SortableValueItem({ id, rank, customValues }: SortableValueItemProps) {
  const label = getValueLabel(id, customValues);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 bg-card rounded-lg shadow-zen transition-shadow",
        isDragging && "shadow-zen-lg z-10 opacity-90"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">#{rank}</span>
      </div>
      <span className="font-medium text-foreground flex-1">{label}</span>
    </div>
  );
}

export function ValuesRank() {
  const { setStep, selectedValues5, rankedValues, setRankedValues, customValues } = useApp();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (rankedValues.length === 0 && selectedValues5.length > 0) {
      setRankedValues(selectedValues5);
    }
  }, [selectedValues5, rankedValues, setRankedValues]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rankedValues.indexOf(active.id as string);
      const newIndex = rankedValues.indexOf(over.id as string);
      setRankedValues(arrayMove(rankedValues, oldIndex, newIndex));
    }
  };

  return (
    <div className="screen-container-scroll">
      <div className="py-4">
        <button
          onClick={() => setStep('values-narrow')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Rank Your Core Values
        </h1>
        <p className="text-sm text-muted-foreground">
          Drag to order from most important (#1) to least (#5)
        </p>
      </div>

      <div className="bg-secondary/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> If two values conflict, which would you choose? 
          That one ranks higher.
        </p>
      </div>

      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rankedValues}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {rankedValues.map((valueId, index) => (
                <SortableValueItem 
                  key={valueId} 
                  id={valueId} 
                  rank={index + 1}
                  customValues={customValues}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="pt-6 pb-8 space-y-3">
        <ZenButton onClick={() => setStep('wheel-intro')}>
          Continue to Life Wheel
        </ZenButton>
        <button
          onClick={() => setStep('dashboard')}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          Save and return later
        </button>
      </div>
    </div>
  );
}
