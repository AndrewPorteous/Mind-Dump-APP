import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ZenButton } from '@/components/ui/ZenButton';
import { AlchemistBadge } from '@/components/ui/Logo';
import { useWelcome } from '@/hooks/useWelcome';
import { TRIGGERS, TriggerCategory } from '@/types';
import { TRIGGER_PROMPTS, readLocal, writeLocal } from '@/data/alchemy';
import { MetalMeter } from './MetalMeter';
import { FocusTimer } from './FocusTimer';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from 'sonner';
import {
  Mic, MicOff, ArrowRight, ArrowLeft, Plus, Shuffle, Pencil, Trash2, Check, X, HelpCircle, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Web Speech API types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const DRAFT_KEY = 'alchemist-mind-dump-draft';
const GUIDE_KEY = 'alchemist-mind-dump-guide-dismissed';

const HOW_IT_WORKS = [
  { n: '1', title: 'Pour it out', body: 'Write every thought, big or small. One per line. No judging.' },
  { n: '2', title: 'Sort it', body: 'Answer two simple questions per thought: important? urgent?' },
  { n: '3', title: 'Act on it', body: 'See your priorities in the Time Matrix and plan your day.' },
];

export function MindDumpInput() {
  const {
    setStep,
    addMindDumpItem,
    updateMindDumpItem,
    getActiveItems,
    activeTriggers,
    toggleTrigger,
  } = useApp();
  const { impact, notification } = useHaptic();
  const { openWelcome } = useWelcome();

  const [inputText, setInputText] = useState(() => readLocal<string>(DRAFT_KEY, ''));
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [showGuide, setShowGuide] = useState(() => !readLocal<boolean>(GUIDE_KEY, false));
  const [promptSeed, setPromptSeed] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recordingRef = useRef(false);

  const activeItems = getActiveItems();
  const newestFirst = useMemo(() => [...activeItems].reverse(), [activeItems]);

  // Autosave the unfinished draft so nothing is lost on refresh or app switch.
  useEffect(() => {
    const id = window.setTimeout(() => writeLocal(DRAFT_KEY, inputText), 300);
    return () => window.clearTimeout(id);
  }, [inputText]);

  // Prompt pool based on chosen triggers (falls back to general prompts).
  const prompt = useMemo(() => {
    const keys = (activeTriggers.length ? activeTriggers : ['general']) as (TriggerCategory | 'general')[];
    const pool = keys.flatMap((k) => TRIGGER_PROMPTS[k] ?? []);
    return pool.length ? pool[promptSeed % pool.length] : '';
  }, [activeTriggers, promptSeed]);

  // Setup Web Speech API once.
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      setInterim(interimTranscript);
      if (finalTranscript) {
        finalTranscript
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => addMindDumpItem(s));
      }
    };

    recognition.onerror = (event) => {
      recordingRef.current = false;
      setIsRecording(false);
      setInterim('');
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast.error('Voice input stopped', {
          description: 'Could not access the microphone. Please check permissions.',
        });
      }
    };

    recognition.onend = () => {
      // Browsers stop after silence; keep listening while the user wants to.
      if (recordingRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      recordingRef.current = false;
      recognition.abort();
    };
  }, [addMindDumpItem]);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    setIsRecording(false);
    setInterim('');
    recognitionRef.current?.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    impact('light');
    if (!recognitionRef.current) {
      toast.error('Voice not available', {
        description: 'Voice input is not supported in this browser. Try Chrome or Safari.',
      });
      return;
    }
    if (recordingRef.current) {
      stopRecording();
      return;
    }
    try {
      recognitionRef.current.start();
      recordingRef.current = true;
      setIsRecording(true);
      toast('Listening…', { description: 'Speak freely. Each sentence becomes a thought.' });
    } catch {
      toast.error('Could not start voice input', { description: 'Check your microphone permissions.' });
    }
  }, [impact, stopRecording]);

  const handleAddItem = () => {
    const lines = inputText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    lines.forEach((line) => addMindDumpItem(line));
    impact('light');
    setInputText('');
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 600);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputText.trim()) {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleContinue = () => {
    if (inputText.trim()) handleAddItem();
    if (recordingRef.current) stopRecording();
    notification('success');
    setStep('mind-dump-sort');
  };

  const handleRemove = (id: string, text: string) => {
    impact('medium');
    // Soft delete so it can be undone and stays in sync with the cloud copy.
    updateMindDumpItem(id, { status: 'discarded' });
    toast('Thought released', {
      description: text.length > 48 ? `${text.slice(0, 48)}…` : text,
      action: { label: 'Undo', onClick: () => updateMindDumpItem(id, { status: 'active' }) },
    });
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) updateMindDumpItem(editingId, { text: editText.trim() });
    setEditingId(null);
  };

  const dismissGuide = () => {
    setShowGuide(false);
    writeLocal(GUIDE_KEY, true);
  };

  const canContinue = activeItems.length > 0 || inputText.trim().length > 0;

  return (
    <div className="screen-container-scroll pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between pt-6 pb-2">
        <button
          onClick={() => setStep('dashboard')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        {!showGuide && (
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            How it works
          </button>
        )}
      </div>

      {/* Header */}
      <div className="pb-4 animate-fade-in">
        <button
          onClick={openWelcome}
          className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
          title="Open the welcome page"
        >
          <AlchemistBadge className="w-7 h-7" />
          <span className="brand-eyebrow">The Alchemist Path</span>
        </button>
        <h1 className="text-3xl font-semibold gold-text leading-tight">Mind Dump</h1>
        <p className="font-serif italic text-lg text-foreground/80 mt-1">
          Turn mental lead into gold.
        </p>
      </div>

      {/* Beginner guide */}
      {showGuide && (
        <div className="zen-card mb-4 p-4 relative">
          <button
            onClick={dismissGuide}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            aria-label="Hide guide"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="native-section-header pt-0 pb-3">How it works</p>
          <ol className="space-y-3">
            {HOW_IT_WORKS.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="metal-medallion w-7 h-7 text-xs font-display text-primary">{s.n}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <button onClick={dismissGuide} className="mt-3 text-xs font-medium text-primary hover:underline">
            Got it — let's begin
          </button>
        </div>
      )}

      {/* Triggers */}
      <div className="pb-4 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <p className="text-sm text-muted-foreground mb-2.5">
          Pick areas to think about <span className="text-muted-foreground/60">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map((trigger) => {
            const active = activeTriggers.includes(trigger.id);
            return (
              <button
                key={trigger.id}
                onClick={() => { impact('light'); toggleTrigger(trigger.id); setPromptSeed(0); }}
                aria-pressed={active}
                className={cn('trigger-tag', active ? 'trigger-tag-active' : 'trigger-tag-inactive')}
              >
                {trigger.emoji} {trigger.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spark prompt */}
      {prompt && (
        <div className="flex items-center gap-3 mb-3 px-3.5 py-3 rounded-xl border border-primary/20 bg-primary/5 animate-fade-in">
          <Lightbulb className="w-4 h-4 text-primary shrink-0" />
          <p key={prompt} className="flex-1 font-serif italic text-base text-foreground/90 animate-thought-in">
            {prompt}
          </p>
          <button
            onClick={() => setPromptSeed((s) => s + 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            aria-label="Show another question"
            title="Another question"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main input area */}
      <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
        <div className={cn('relative rounded-xl transition-shadow', justAdded && 'shadow-[var(--gold-glow)]')}>
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'Write what\'s on your mind…\nPress Enter to add each thought.'}
            className="zen-input h-[132px] resize-none text-base leading-relaxed pr-14 pb-12"
            aria-label="Write a thought"
            autoFocus
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {inputText.trim() && (
              <button
                onClick={handleAddItem}
                className="h-10 px-3 rounded-full flex items-center gap-1 text-sm font-semibold text-primary-foreground animate-fade-in"
                style={{ background: 'var(--gold-gradient)' }}
                aria-label="Add thought"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
            <button
              onClick={toggleRecording}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all border',
                isRecording
                  ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse-soft'
                  : 'bg-secondary text-primary border-primary/30 hover:border-primary/60',
              )}
              aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
              title={isRecording ? 'Stop voice input' : 'Speak your thoughts'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 py-2.5 min-h-[44px]">
          {isRecording ? (
            <p className="flex items-center gap-2 text-sm text-primary truncate">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
              {interim || 'Listening… speak your thoughts'}
            </p>
          ) : (
            <FocusTimer
              onFinish={() => {
                notification('success');
                toast.success("Time's up!", {
                  description: 'Great sprint. Ready to sort your thoughts?',
                  action: { label: 'Sort now', onClick: handleContinue },
                });
              }}
            />
          )}
          <span className="hidden sm:inline text-[11px] text-muted-foreground/70 shrink-0">Shift + Enter = new line</span>
        </div>
      </div>

      {/* Transmutation meter */}
      <div className="pt-1 pb-4">
        <MetalMeter count={activeItems.length} />
      </div>

      {/* Captured thoughts */}
      {newestFirst.length > 0 ? (
        <div className="pb-4">
          <p className="native-section-header">Captured thoughts</p>
          <ul className="space-y-2">
            {newestFirst.map((item) => (
              <li key={item.id} className="group metal-plate px-3.5 py-2.5 animate-thought-in">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={saveEdit}
                      className="flex-1 bg-transparent text-sm text-foreground border-b border-primary/50 py-1"
                      aria-label="Edit thought"
                      autoFocus
                    />
                    <button onMouseDown={(e) => e.preventDefault()} onClick={saveEdit} className="p-1.5 text-primary" aria-label="Save">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
                    <button
                      onClick={() => startEdit(item.id, item.text)}
                      className="flex-1 text-left text-sm text-foreground leading-snug py-1"
                      title="Tap to edit"
                    >
                      {item.text}
                    </button>
                    <button
                      onClick={() => startEdit(item.id, item.text)}
                      className="p-1.5 text-muted-foreground hover:text-primary sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      aria-label="Edit thought"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id, item.text)}
                      className="p-1.5 text-muted-foreground hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      aria-label="Remove thought"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <p className="font-serif italic text-base text-foreground/70">“As within, so without.”</p>
          <p className="mt-1">Your thoughts will appear here as you add them.</p>
        </div>
      )}

      {/* Sticky action */}
      <div className="fixed left-0 right-0 z-40 px-5" style={{ bottom: 'calc(4.75rem + var(--safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto">
          <ZenButton onClick={handleContinue} disabled={!canContinue} className="gap-2">
            {activeItems.length > 0 ? `Sort my ${activeItems.length} thought${activeItems.length !== 1 ? 's' : ''}` : 'Sort my thoughts'}
            <ArrowRight className="w-4 h-4" />
          </ZenButton>
        </div>
      </div>
    </div>
  );
}
