import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Quadrant, QUADRANTS } from '@/types';
import { QUADRANT_STYLE, quadrantFromAnswers, readLocal, writeLocal } from '@/data/alchemy';
import { ArrowLeft, ArrowRight, Archive, Undo2, Sparkles, ListChecks, Compass, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ZenButton } from '@/components/ui/ZenButton';
import { useHaptic } from '@/hooks/useHaptic';

type Assignment = Quadrant | 'archive';
type Mode = 'guided' | 'list';
type Stage = 'important' | 'urgent' | 'result';

const DRAFT_KEY = 'alchemist-sort-draft';
const MODE_KEY = 'alchemist-sort-mode';
const QUADRANT_IDS: Quadrant[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function QuadrantBadge({ q, className }: { q: Quadrant; className?: string }) {
  const s = QUADRANT_STYLE[q];
  return (
    <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-bold border', s.bg, s.text, s.border, className)}>
      {q}
    </span>
  );
}

export function MindDumpSort() {
  const { setStep, getUnsortedItems, updateMindDumpItem, moveItemToTask } = useApp();
  const { impact, notification } = useHaptic();

  const items = getUnsortedItems();
  const itemIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  // Assignments survive a refresh until they are applied.
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(() => {
    const saved = readLocal<Record<string, Assignment>>(DRAFT_KEY, {});
    return Object.fromEntries(Object.entries(saved).filter(([id]) => itemIds.has(id)));
  });
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>(() => readLocal<Mode>(MODE_KEY, 'guided'));
  const [stage, setStage] = useState<Stage>('important');
  const [important, setImportant] = useState<boolean | null>(null);
  const [suggested, setSuggested] = useState<Quadrant | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => writeLocal(DRAFT_KEY, Object.keys(assignments).length ? assignments : null), [assignments]);
  useEffect(() => writeLocal(MODE_KEY, mode), [mode]);

  const assignedCount = Object.keys(assignments).length;
  const remaining = items.filter((i) => !assignments[i.id]);
  const current = remaining[0] ?? null;
  const progress = items.length ? assignedCount / items.length : 0;

  const resetQuestions = () => {
    setStage('important');
    setImportant(null);
    setSuggested(null);
  };

  const assign = useCallback((itemId: string, a: Assignment) => {
    impact('light');
    setAssignments((prev) => ({ ...prev, [itemId]: a }));
    setHistory((h) => [...h, itemId]);
    setActiveItemId(null);
    resetQuestions();
  }, [impact]);

  const undo = useCallback(() => {
    const last = history[history.length - 1];
    if (!last) return;
    impact('light');
    setHistory((h) => h.slice(0, -1));
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[last];
      return next;
    });
    resetQuestions();
  }, [history, impact]);

  const answer = useCallback((yes: boolean) => {
    impact('light');
    if (stage === 'important') {
      setImportant(yes);
      setStage('urgent');
    } else if (stage === 'urgent' && important !== null) {
      setSuggested(quadrantFromAnswers(important, yes));
      setStage('result');
    }
  }, [stage, important, impact]);

  const handleContinue = () => {
    Object.entries(assignments).forEach(([id, a]) => {
      if (a === 'archive') {
        updateMindDumpItem(id, { isActionable: false, status: 'archived' });
      } else {
        updateMindDumpItem(id, { isActionable: true });
        moveItemToTask(id, a);
      }
    });
    writeLocal(DRAFT_KEY, null);
    notification('success');
    setStep('time-matrix');
  };

  // Keyboard shortcuts for the guided flow.
  useEffect(() => {
    if (mode !== 'guided' || !current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (stage !== 'result' && (k === 'y' || k === 'n')) answer(k === 'y');
      else if (stage === 'result' && suggested && k === 'enter') assign(current.id, suggested);
      else if (['1', '2', '3', '4'].includes(k)) assign(current.id, QUADRANT_IDS[Number(k) - 1]);
      else if (k === 'a') assign(current.id, 'archive');
      else if (k === 'z' || k === 'backspace') undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, current, stage, suggested, answer, assign, undo]);

  const counts = useMemo(() => {
    const c: Record<Assignment, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, archive: 0 };
    Object.values(assignments).forEach((a) => { c[a] += 1; });
    return c;
  }, [assignments]);

  const activeItem = activeItemId ? items.find((i) => i.id === activeItemId) : null;

  if (items.length === 0) {
    return (
      <div className="screen-container-scroll">
        <div className="pt-6 pb-4 animate-fade-in">
          <button
            onClick={() => setStep('mind-dump')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dump
          </button>
          <div className="zen-card text-center py-10">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-semibold gold-text">Nothing to sort</h1>
            <p className="text-sm text-muted-foreground mt-2 mb-5">Pour out a few thoughts first — then come back here.</p>
            <ZenButton onClick={() => setStep('mind-dump')}>Start a Mind Dump</ZenButton>
          </div>
        </div>
      </div>
    );
  }

  const quadrantInfo = (q: Quadrant) => QUADRANTS.find((x) => x.id === q)!;

  return (
    <div className="screen-container-scroll pb-28">
      {/* Header */}
      <div className="pt-6 pb-3 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setStep('mind-dump')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dump
          </button>
          <button
            onClick={undo}
            disabled={!history.length}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>
        </div>
        <span className="brand-eyebrow">Step 2 · Transmute</span>
        <div className="flex items-end justify-between mt-1">
          <h1 className="text-2xl font-semibold gold-text">Sort your thoughts</h1>
          <span className="text-sm text-muted-foreground tabular-nums">{assignedCount}/{items.length}</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress * 100}%`, background: 'var(--gold-gradient)' }} />
        </div>

        {/* Mode switch */}
        <div className="mt-4 grid grid-cols-2 p-1 rounded-xl bg-secondary/70 border border-primary/15" role="tablist">
          {([
            { id: 'guided', label: 'Guided', icon: Compass },
            { id: 'list', label: 'Quick list', icon: ListChecks },
          ] as const).map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => { setMode(m.id); resetQuestions(); }}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                mode === m.id ? 'bg-primary/15 text-primary border border-primary/40' : 'text-muted-foreground',
              )}
            >
              <m.icon className="w-4 h-4" /> {m.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'guided' ? (
        current ? (
          <div className="flex-1 pb-4">
            {/* Thought card */}
            <div key={current.id} className="metal-plate p-5 animate-thought-in">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Thought {assignedCount + 1} of {items.length}
              </p>
              <p className="text-lg text-foreground leading-snug">{current.text}</p>
            </div>

            {/* Questions */}
            <div className="mt-4 zen-card p-4">
              {stage !== 'result' ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="metal-medallion w-6 h-6 text-[11px] font-display text-primary">
                      {stage === 'important' ? '1' : '2'}
                    </span>
                    <p className="font-display text-base tracking-wide text-foreground">
                      {stage === 'important' ? 'Is it important?' : 'Is it urgent?'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 ml-8">
                    {stage === 'important'
                      ? 'Does it move you toward your goals or values?'
                      : 'Does it need attention in the next day or two?'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => answer(true)} className="zen-button-secondary flex items-center justify-center gap-2 !py-3">
                      <Check className="w-4 h-4 text-primary" /> Yes
                    </button>
                    <button onClick={() => answer(false)} className="zen-button-secondary flex items-center justify-center gap-2 !py-3">
                      <X className="w-4 h-4 text-muted-foreground" /> No
                    </button>
                  </div>
                  {stage === 'urgent' && (
                    <button onClick={resetQuestions} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground">
                      ← Change first answer
                    </button>
                  )}
                </>
              ) : suggested && (
                <div className="animate-thought-in">
                  <p className="text-xs text-muted-foreground mb-2">This belongs in</p>
                  <div className={cn('rounded-xl border p-4', QUADRANT_STYLE[suggested].bg, QUADRANT_STYLE[suggested].border)}>
                    <div className="flex items-center gap-2">
                      <QuadrantBadge q={suggested} />
                      <p className={cn('font-display text-lg tracking-wide', QUADRANT_STYLE[suggested].text)}>
                        {quadrantInfo(suggested).title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{quadrantInfo(suggested).subtitle}</p>
                    {quadrantInfo(suggested).action && (
                      <p className="text-sm text-foreground/90 mt-2">{quadrantInfo(suggested).action}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-2 mt-3">
                    <ZenButton onClick={() => assign(current.id, suggested)} className="!py-3 gap-2">
                      Confirm <ArrowRight className="w-4 h-4" />
                    </ZenButton>
                    <button onClick={resetQuestions} className="px-4 rounded-2xl text-sm text-muted-foreground border border-primary/20 hover:text-foreground">
                      Redo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shortcuts for those who already know */}
            <p className="native-section-header mt-4">Already know? Tap a quadrant</p>
            <div className="grid grid-cols-4 gap-2">
              {QUADRANT_IDS.map((q) => (
                <button
                  key={q}
                  onClick={() => assign(current.id, q)}
                  className={cn('rounded-xl border py-2.5 flex flex-col items-center gap-0.5 transition-transform active:scale-95', QUADRANT_STYLE[q].bg, QUADRANT_STYLE[q].border)}
                >
                  <span className={cn('font-bold text-sm', QUADRANT_STYLE[q].text)}>{q}</span>
                  <span className="text-[10px] text-muted-foreground">{quadrantInfo(q).title}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => assign(current.id, 'archive')}
              className="mt-2 w-full text-sm text-muted-foreground py-2.5 hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Not actionable — let it go
            </button>
            <p className="hidden sm:block text-center text-[11px] text-muted-foreground/60 mt-1">
              Keys: Y / N to answer · 1–4 quadrant · A let go · Z undo
            </p>
          </div>
        ) : (
          /* All sorted */
          <div className="flex-1 pb-4 animate-fade-in">
            <div className="zen-card text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <h2 className="text-xl gold-text">Transmutation complete</h2>
              <p className="text-sm text-muted-foreground mt-1">Every thought has found its place.</p>
              <div className="grid grid-cols-5 gap-2 mt-5">
                {QUADRANT_IDS.map((q) => (
                  <div key={q} className={cn('rounded-xl border py-2', QUADRANT_STYLE[q].bg, QUADRANT_STYLE[q].border)}>
                    <p className={cn('text-lg font-bold', QUADRANT_STYLE[q].text)}>{counts[q]}</p>
                    <p className="text-[10px] text-muted-foreground">{q}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-border/50 py-2">
                  <p className="text-lg font-bold text-muted-foreground">{counts.archive}</p>
                  <p className="text-[10px] text-muted-foreground">Let go</p>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Quick list mode */
        <div className="flex-1 space-y-2 pb-4">
          <p className="text-sm text-muted-foreground mb-1">Tap any thought to choose its quadrant.</p>
          {items.map((item) => {
            const a = assignments[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                className={cn('w-full flex items-center gap-3 p-3 metal-plate text-left active:scale-[0.99] transition-all', a && 'opacity-80')}
              >
                <span className="flex-1 text-sm text-foreground">{item.text}</span>
                {a && a !== 'archive' && <QuadrantBadge q={a} />}
                {a === 'archive' && <Archive className="w-4 h-4 text-muted-foreground" />}
                {!a && <span className="text-xs text-primary/80">Sort</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky continue */}
      <div className="fixed left-0 right-0 z-40 px-5" style={{ bottom: 'calc(4.75rem + var(--safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto">
          <ZenButton onClick={handleContinue} disabled={assignedCount === 0} className="gap-2">
            {remaining.length === 0 ? 'Open my Time Matrix' : `Save ${assignedCount} & open Matrix`}
            <ArrowRight className="w-4 h-4" />
          </ZenButton>
        </div>
      </div>

      <BottomSheet open={!!activeItem} onClose={() => setActiveItemId(null)} title="Where does this belong?">
        {activeItem && (
          <div className="space-y-3">
            <p className="text-sm text-foreground bg-secondary/60 border border-primary/15 rounded-lg p-3">{activeItem.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {QUADRANTS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => assign(activeItem.id, q.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-transform active:scale-95',
                    QUADRANT_STYLE[q.id].bg, QUADRANT_STYLE[q.id].border,
                    assignments[activeItem.id] === q.id && 'ring-2 ring-primary',
                  )}
                >
                  <span className={cn('font-semibold text-sm', QUADRANT_STYLE[q.id].text)}>{q.id} — {q.title}</span>
                  <span className="text-[11px] text-muted-foreground">{q.subtitle}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => assign(activeItem.id, 'archive')}
              className="w-full text-sm text-muted-foreground py-2 hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Not actionable — let it go
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
