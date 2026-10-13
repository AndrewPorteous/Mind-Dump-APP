import { useEffect, useRef, useState } from 'react';
import { METAL_STAGES, getMetalProgress } from '@/data/alchemy';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface MetalMeterProps {
  count: number;
}

/**
 * Seven-step transmutation meter: every thought captured moves the
 * user from Lead toward Palladium. Celebrates each new metal.
 */
export function MetalMeter({ count }: MetalMeterProps) {
  const { index, current, next, progress } = getMetalProgress(count);
  const prevIndex = useRef(index);
  const [celebrate, setCelebrate] = useState(0);

  useEffect(() => {
    if (index > prevIndex.current) setCelebrate((c) => c + 1);
    prevIndex.current = index;
  }, [index]);

  const color = current ? `hsl(var(${current.colorVar}))` : 'hsl(var(--muted-foreground))';

  return (
    <div className="metal-plate p-3.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="relative metal-medallion w-11 h-11">
          <span className="font-display text-sm font-bold" style={{ color }}>
            {current ? current.name.slice(0, 2) : '··'}
          </span>
          {celebrate > 0 && (
            <Sparkles key={celebrate} className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-sparkle" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display text-sm tracking-wider text-foreground truncate">
              {current ? `${index + 1}. ${current.name}` : 'Raw material'}
              {current && <span className="ml-2 text-[11px] text-primary/90 uppercase tracking-[0.15em]">{current.meaning}</span>}
            </p>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
              {count} thought{count !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%`, background: 'var(--gold-gradient)' }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {next
              ? `${next.threshold - count} more to transmute into ${next.name}`
              : 'Palladium reached — your mind is clear. Time to sort.'}
          </p>
        </div>
      </div>

      {/* Seven-step path */}
      <div className="mt-3 flex items-center gap-1" aria-hidden="true">
        {METAL_STAGES.map((stage, i) => (
          <div
            key={stage.id}
            title={`${stage.name} · ${stage.meaning}`}
            className={cn('h-1 flex-1 rounded-full transition-all duration-500', i <= index ? 'opacity-100' : 'opacity-20')}
            style={{ background: `hsl(var(${stage.colorVar}))` }}
          />
        ))}
      </div>
    </div>
  );
}
