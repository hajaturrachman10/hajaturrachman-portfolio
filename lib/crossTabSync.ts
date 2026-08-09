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

export type ToggleChangedPayload = {
  feature: "vault" | "ecl" | "cv" | string;
  unlocked: boolean;
  timestamp: number;
};

type SyncMessage = {
  event: CrossTabEvent;
  payload?: any;
  data?: any;
  timestamp: number;
};

const CHANNEL_NAME = "hajat_portfolio_cross_tab_sync";
let broadcastChannel: BroadcastChannel | null = null;
let lastProcessedTimestamp = 0;

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

  const processMessage = (msg: SyncMessage) => {
    if (!msg || !msg.event) return;
    
    // Deduplicate identical events arriving within 100ms
    if (msg.timestamp && msg.timestamp === lastProcessedTimestamp) {
      return;
    }
    if (msg.timestamp) {
      lastProcessedTimestamp = msg.timestamp;
    }

    callback(msg);
  };

  // BroadcastChannel Listener
  const handleBroadcast = (e: MessageEvent<SyncMessage>) => {
    if (e.data) {
      processMessage(e.data);
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
        processMessage(msg);
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
