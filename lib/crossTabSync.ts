type CrossTabEvent =
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT"
  | "ADMIN_SESSION_EXPIRED"
  | "TOGGLE_CHANGED"
  | "CONFIG_RESTORED"
  | "CONFIG_UPDATED"
  | "STRATEGY_UPDATED"
  | "SESSION_REVOKED"
  | "LOCKOUT_RESET"
  | "PUBLIC_SESSION_INVALID"
  | "RESOURCE_LOCKED"
  | "RESOURCE_UNLOCKED";

type SyncMessage = {
  event: CrossTabEvent;
  payload?: any;
  data?: any;
  timestamp: number;
};

const CHANNEL_NAME = "hajat_portfolio_cross_tab_sync";
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

export function broadcastCrossTabEvent(event: CrossTabEvent, payload?: any): void {
  if (typeof window === "undefined") return;

  const msg: SyncMessage = {
    event,
    payload,
    timestamp: Date.now()
  };

  // 1. Send via BroadcastChannel API
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(msg);
    } catch {
      // Fallback
    }
  }

  // 2. Fallback via LocalStorage event for older browsers
  try {
    localStorage.setItem("hajat_sync_event", JSON.stringify(msg));
    localStorage.removeItem("hajat_sync_event");
  } catch {
    // LocalStorage fallback error handled
  }
}

export function subscribeCrossTabSync(callback: (msg: SyncMessage) => void): () => void {
  if (typeof window === "undefined") return () => {};

  // BroadcastChannel Listener
  const handleBroadcast = (e: MessageEvent<SyncMessage>) => {
    if (e.data && e.data.event) {
      callback(e.data);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBroadcast);
    return () => {
      broadcastChannel?.removeEventListener("message", handleBroadcast);
    };
  }

  // Storage Event Listener Fallback ONLY if BroadcastChannel is unavailable
  const handleStorage = (e: StorageEvent) => {
    if (e.key === "hajat_sync_event" && e.newValue) {
      try {
        const msg = JSON.parse(e.newValue) as SyncMessage;
        callback(msg);
      } catch {
        // Parse error handled
      }
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}
