import { useApp } from '@/context/AppContext';
import { Mail, ArrowRight, X } from 'lucide-react';
import { saveUserPreferences } from '@/services/cloudSync';

export function EmailTipsConsent() {
  const { setStep, setUser, user } = useApp();

  const handleYes = () => {
    localStorage.setItem('minded-dump-tips-optin', 'true');
    saveUserPreferences(true);
    setUser({ ...user });
    setStep('paywall');
  };

  const handleNo = () => {
    localStorage.setItem('minded-dump-tips-optin', 'false');
    saveUserPreferences(false);
    setStep('paywall');
  };

  return (
    <div className="screen-container-scroll">
      {/* Header */}
      <div className="pt-12 pb-8 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          One more thing...
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Would you like a time management tip or trick sent to you every two days by email?
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col justify-center space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <button
          onClick={handleYes}
          className="w-full bg-card rounded-lg shadow-zen p-5 flex items-center gap-4 hover:shadow-zen-lg transition-all border-2 border-transparent hover:border-primary text-left group"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Yes, send me tips</h3>
            <p className="text-sm text-muted-foreground">Get practical advice every 2 days</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={handleNo}
          className="w-full bg-card rounded-lg shadow-zen p-5 flex items-center gap-4 hover:shadow-zen-lg transition-all text-left group"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <X className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">No thanks</h3>
            <p className="text-sm text-muted-foreground">I can enable this later</p>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
        <p className="text-xs text-muted-foreground">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}