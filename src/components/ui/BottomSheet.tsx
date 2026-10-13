import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div ref={sheetRef} className="bottom-sheet">
        <div className="bottom-sheet-handle" />
        {title && (
          <div className="px-5 pt-2 pb-3 border-b border-border/30">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
        )}
        <div className="px-5 py-4 pb-safe">
          {children}
        </div>
      </div>
    </>
  );
}
