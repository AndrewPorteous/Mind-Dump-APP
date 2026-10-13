import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { fetchUserPreferences, saveUserPreferences } from '@/services/cloudSync';

export function EmailPreferences() {
  const { user: authUser } = useAuth();
  const [tipsOptedIn, setTipsOptedIn] = useState(() => {
    return localStorage.getItem('minded-dump-tips-optin') === 'true';
  });

  // Load from cloud on mount
  useEffect(() => {
    fetchUserPreferences().then((prefs) => {
      if (prefs !== null) {
        setTipsOptedIn(prefs.tipsOptedIn);
        localStorage.setItem('minded-dump-tips-optin', prefs.tipsOptedIn ? 'true' : 'false');
      }
    });
  }, []);

  const handleToggleTips = (checked: boolean) => {
    setTipsOptedIn(checked);
    localStorage.setItem('minded-dump-tips-optin', checked ? 'true' : 'false');
    saveUserPreferences(checked);
  };

  return (
    <div className="bg-card rounded-lg shadow-zen p-5 space-y-5">
      {/* Tips toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Label htmlFor="tips-toggle" className="font-medium text-foreground cursor-pointer">
              Time management tips
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive a tip every 2 days
            </p>
          </div>
        </div>
        <Switch
          id="tips-toggle"
          checked={tipsOptedIn}
          onCheckedChange={handleToggleTips}
        />
      </div>

      {/* Email display */}
      {authUser?.email && (
        <div className="pt-3 border-t border-border">
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Email address
          </Label>
          <p className="text-sm text-muted-foreground">{authUser.email}</p>
        </div>
      )}
    </div>
  );
}