import { useApp } from '@/context/AppContext';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { EmailPreferences } from './EmailPreferences';
import { PrivacySection } from './PrivacySection';
import { AccountSection } from './AccountSection';

export function SettingsPage() {
  const { setStep } = useApp();

  return (
    <div className="screen-container-scroll pb-4">
      {/* Header */}
      <div className="pt-6 pb-4 animate-fade-in">
        <button
          onClick={() => setStep('dashboard')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences
        </p>
      </div>

      {/* Settings sections */}
      <div className="flex-1 space-y-6 animate-slide-up">
        {/* Email & Notifications */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Email & Notifications
          </h2>
          <EmailPreferences />
        </section>

        {/* Privacy & Trust */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Privacy & Trust
          </h2>
          <PrivacySection />
        </section>

        {/* Account */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Account
          </h2>
          <AccountSection />
        </section>
      </div>
    </div>
  );
}
