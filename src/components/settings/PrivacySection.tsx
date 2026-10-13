import { useState } from 'react';
import { Shield, Lock, Eye, X } from 'lucide-react';

export function PrivacySection() {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <>
      <div className="bg-card rounded-lg shadow-zen p-5 space-y-4">
        {/* Main privacy message */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Your data is safe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use your data only to save progress and personalize tips. 
              <span className="font-medium text-foreground"> No spam. Ever.</span>
            </p>
          </div>
        </div>

        {/* Privacy points */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Data encrypted in transit and at rest</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">We never sell your personal information</span>
          </div>
        </div>

        {/* Privacy policy link */}
        <div className="pt-3 border-t border-border">
          <button
            onClick={() => setShowPolicy(true)}
            className="text-sm text-primary hover:underline"
          >
            Read our privacy policy →
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-card rounded-lg shadow-zen-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Privacy Policy</h2>
              <button onClick={() => setShowPolicy(false)} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h3 className="font-medium text-foreground mb-1">Data Collection</h3>
                <p>We collect only the information necessary to provide AM Training services: your email address, first name, and the data you enter within the app (goals, tasks, wheel scores, purpose answers).</p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-1">How We Use Your Data</h3>
                <p>Your data is used exclusively to save your progress, personalize your experience, and send optional tip emails if you opt in. We never use your data for advertising or sell it to third parties.</p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-1">Data Storage & Security</h3>
                <p>All data is encrypted in transit (TLS) and at rest. Your information is stored securely in our cloud infrastructure with industry-standard security practices.</p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-1">Your Rights</h3>
                <p>You can request to view, export, or delete all your personal data at any time by contacting us. Account deletion removes all associated data permanently.</p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-1">Cookies</h3>
                <p>We use essential cookies only for authentication and session management. No tracking or advertising cookies are used.</p>
              </section>

              <section>
                <h3 className="font-medium text-foreground mb-1">Contact</h3>
                <p>For any privacy-related questions, please reach out to us through the app's settings page.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
