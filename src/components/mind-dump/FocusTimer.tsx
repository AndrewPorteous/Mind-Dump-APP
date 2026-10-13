import { useEffect, useRef, useState } from 'react';
import { Hourglass, Pause, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESETS = [2, 5, 10];

interface FocusTimerProps {
  onFinish: () => void;
}

/** Optional sprint timer: a short deadline helps beginners write without judging. */
export function FocusTimer({ onFinish }: FocusTimerProps) {
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setRunning(false);
          onFinishRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const start = (minutes: number) => {
    setTotal(minutes * 60);
    setLeft(minutes * 60);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setTotal(0);
    setLeft(0);
  };

  if (total === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Hourglass className="w-3.5 h-3.5 text-primary/80" />
        <span>Sprint timer:</span>
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => start(m)}
            className="px-2.5 py-1 rounded-full border border-primary/25 hover:border-primary/60 hover:text-foreground transition-colors"
          >
            {m} min
          </button>
        ))}
      </div>
    );
  }

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  const pct = total ? left / total : 0;
  const r = 14;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-3 text-sm">
      <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className={cn('font-display tabular-nums tracking-wider', left === 0 ? 'text-primary' : 'text-foreground')}>
        {left === 0 ? "Time's up" : `${mm}:${ss}`}
      </span>
      {left > 0 && (
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70"
          aria-label={running ? 'Pause timer' : 'Resume timer'}
        >
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      )}
      <button
        onClick={reset}
        className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/70"
        aria-label="Stop timer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
