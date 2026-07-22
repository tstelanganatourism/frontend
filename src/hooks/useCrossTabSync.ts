import { useEffect, useCallback } from 'react';

type SyncPayload = {
  type: 'AUTH' | 'BOOKING' | 'PAYMENT' | 'INVENTORY' | 'DASHBOARD';
  action: string;
  data?: any;
};

export function useCrossTabSync(onSyncEvent: (payload: SyncPayload) => void) {
  const handleEvent = useCallback((payload: SyncPayload) => {
    // Only process events from other tabs
    onSyncEvent(payload);
  }, [onSyncEvent]);

  useEffect(() => {
    // Primary: BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('ts-boat-sync');
      
      channel.onmessage = (event) => {
        if (event.data && event.data.type) {
          handleEvent(event.data);
        }
      };

      return () => {
        channel.close();
      };
    }

    // Fallback: localStorage
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'ts-boat-sync-fallback' && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          handleEvent(payload);
        } catch (e) {
          console.error("Failed to parse sync event from storage fallback", e);
        }
      }
    };

    const win = window as unknown as Window;
    win.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [handleEvent]);

  // Method to emit events
  const emitSyncEvent = useCallback((payload: SyncPayload) => {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('ts-boat-sync');
        channel.postMessage(payload);
        channel.close();
      } else {
        // Fallback: use localStorage trick
        // Append a timestamp so the value always changes and triggers the event
        (window as any).localStorage.setItem('ts-boat-sync-fallback', JSON.stringify({ ...payload, _t: Date.now() }));
      }
    }
  }, []);

  return { emitSyncEvent };
}
