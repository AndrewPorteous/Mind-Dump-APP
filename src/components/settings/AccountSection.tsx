import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Crown, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountSection() {
  const { user, setStep, resetApp } = useApp();
  const { user: authUser, signOut } = useAuth();
  const isPaid = user?.paymentStatus === 'paid';

  const displayName = authUser?.user_metadata?.first_name || user?.firstName || '';
  const displayEmail = authUser?.email || user?.email || '';

  const handleReset = async () => {
    resetApp();
    await signOut();
    setStep('onboarding-welcome');
  };

  const handleSignOut = async () => {
    await signOut();
    setStep('onboarding-welcome');
  };

  return (
    <div className="space-y-4">
      {/* Payment status */}
      <div className="bg-card rounded-lg shadow-zen p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPaid ? 'bg-primary/10' : 'bg-muted'}`}>
              <Crown className={`w-5 h-5 ${isPaid ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {isPaid ? 'Full Access' : 'Free Version'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isPaid ? 'All features unlocked' : 'Limited features'}
              </p>
            </div>
          </div>
          {!isPaid && (
            <button
              onClick={() => setStep('paywall')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* User info */}
      {(displayName || displayEmail) && (
        <div className="bg-card rounded-lg shadow-zen p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Account info</h3>
          {displayName && <p className="text-foreground font-medium">{displayName}</p>}
          {displayEmail && (
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
          )}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 bg-card rounded-lg shadow-zen p-5 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Sign out</h3>
          <p className="text-sm text-muted-foreground">Log out of your account</p>
        </div>
      </button>

      {/* Danger zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reset all data and start fresh. This action cannot be undone.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Reset App
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data including mind dumps, tasks, 
                    goals, and settings. You will also be signed out. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}