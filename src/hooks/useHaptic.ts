export function useHaptic() {
  const isCapacitor = typeof (window as any)?.Capacitor !== 'undefined';

  const impact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    // Try Capacitor Haptics first
    if (isCapacitor) {
      try {
        const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins;
        if (Haptics) {
          const capStyle = style === 'light' ? ImpactStyle?.Light 
            : style === 'medium' ? ImpactStyle?.Medium 
            : ImpactStyle?.Heavy;
          Haptics.impact({ style: capStyle });
          return;
        }
      } catch {}
    }
    // Fallback to Vibration API
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  };

  const selection = () => {
    if (isCapacitor) {
      try {
        const { Haptics } = (window as any).Capacitor.Plugins;
        if (Haptics) { Haptics.selectionStart(); Haptics.selectionEnd(); return; }
      } catch {}
    }
    impact('light');
  };

  const notification = (type: 'success' | 'warning' | 'error' = 'success') => {
    if (isCapacitor) {
      try {
        const { Haptics, NotificationType } = (window as any).Capacitor.Plugins;
        if (Haptics) {
          const capType = type === 'success' ? NotificationType?.Success
            : type === 'warning' ? NotificationType?.Warning
            : NotificationType?.Error;
          Haptics.notification({ type: capType });
          return;
        }
      } catch {}
    }
    if ('vibrate' in navigator) {
      switch (type) {
        case 'success': navigator.vibrate([10, 50, 10]); break;
        case 'warning': navigator.vibrate([20, 100, 20]); break;
        case 'error': navigator.vibrate([30, 50, 30, 50, 30]); break;
      }
    }
  };

  return { impact, selection, notification };
}
