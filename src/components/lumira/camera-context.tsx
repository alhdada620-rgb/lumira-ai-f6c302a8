import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";

const AR_OVERLAY_STORAGE_KEY = "lumira:ar-overlay-history";
const MAX_HISTORY = 20;

export type AROverlayKind = "outfit" | "lipstick" | "eyeliner" | "blush";

export interface AROverlay {
  /** Source identifier (e.g. catalog item id) */
  id: string;
  kind: AROverlayKind;
  /** Display label shown on the mirror HUD */
  label: string;
  /** CSS color or gradient string used to render the placeholder filter */
  color: string;
  /** Brand or category sub-label */
  sub?: string;
  ts: number;
}

/**
 * History entries can be a real overlay OR `null` (representing "no overlay" /
 * cleared state). Keeping nulls in history lets users undo a Reset and get the
 * previous look back.
 */
type HistoryEntry = AROverlay | null;

interface PersistedState {
  history: HistoryEntry[];
  cursor: number;
}

function isAROverlay(value: unknown): value is AROverlay {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<AROverlay>;
  return (
    typeof v.id === "string" &&
    typeof v.label === "string" &&
    typeof v.color === "string" &&
    (v.kind === "outfit" || v.kind === "lipstick" || v.kind === "eyeliner" || v.kind === "blush")
  );
}

function readPersistedState(): PersistedState {
  const empty: PersistedState = { history: [], cursor: -1 };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(AR_OVERLAY_STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!parsed || !Array.isArray(parsed.history)) return empty;
    const history: HistoryEntry[] = parsed.history.map((entry) => {
      if (entry === null) return null;
      if (isAROverlay(entry)) {
        return {
          id: entry.id,
          kind: entry.kind,
          label: entry.label,
          color: entry.color,
          sub: typeof entry.sub === "string" ? entry.sub : undefined,
          ts: typeof entry.ts === "number" ? entry.ts : Date.now(),
        };
      }
      return null;
    });
    const cursor =
      typeof parsed.cursor === "number" && parsed.cursor >= -1 && parsed.cursor < history.length
        ? parsed.cursor
        : history.length - 1;
    return { history, cursor };
  } catch {
    return empty;
  }
}

interface CameraContextValue {
  stream: MediaStream | null;
  active: boolean;
  error: string | null;
  starting: boolean;
  start: () => Promise<void>;
  stop: () => void;
  /** Currently applied AR filter on the mirror feed (null = no overlay) */
  arOverlay: AROverlay | null;
  setAROverlay: (overlay: Omit<AROverlay, "ts"> | null) => void;
  clearAROverlay: () => void;
  /** Undo / redo controls for the AR overlay timeline */
  canUndoAR: boolean;
  canRedoAR: boolean;
  undoAR: () => void;
  redoAR: () => void;
  /** Number of entries in the AR overlay history (for HUD display) */
  arHistoryLength: number;
  arHistoryIndex: number;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [{ history, cursor }, setHistoryState] = useState<PersistedState>(() => readPersistedState());
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setError(null);
    setStarting(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = s;
      setStream(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera unavailable";
      setError(msg.includes("Permission") || msg.includes("denied") ? "Camera access denied" : msg);
    } finally {
      setStarting(false);
    }
  }, []);

  /** Push a new history entry, truncating any redo tail and capping the stack. */
  const pushHistory = useCallback((entry: HistoryEntry) => {
    setHistoryState((prev) => {
      const current = prev.cursor >= 0 ? prev.history[prev.cursor] : null;
      // Skip no-op pushes (same id, same kind, or both null).
      const sameAsCurrent =
        (current === null && entry === null) ||
        (current !== null && entry !== null && current.id === entry.id && current.kind === entry.kind);
      if (sameAsCurrent) return prev;

      const truncated = prev.history.slice(0, prev.cursor + 1);
      const next = [...truncated, entry];
      // Cap history length, preserving the newest entries.
      const overflow = Math.max(0, next.length - MAX_HISTORY);
      const trimmed = overflow > 0 ? next.slice(overflow) : next;
      return { history: trimmed, cursor: trimmed.length - 1 };
    });
  }, []);

  const setAROverlay = useCallback(
    (overlay: Omit<AROverlay, "ts"> | null) => {
      pushHistory(overlay ? { ...overlay, ts: Date.now() } : null);
    },
    [pushHistory],
  );

  const clearAROverlay = useCallback(() => {
    pushHistory(null);
  }, [pushHistory]);

  const undoAR = useCallback(() => {
    setHistoryState((prev) => (prev.cursor > -1 ? { ...prev, cursor: prev.cursor - 1 } : prev));
  }, []);

  const redoAR = useCallback(() => {
    setHistoryState((prev) =>
      prev.cursor < prev.history.length - 1 ? { ...prev, cursor: prev.cursor + 1 } : prev,
    );
  }, []);

  // Persist history + cursor so undo/redo survives reloads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (history.length === 0) {
        window.localStorage.removeItem(AR_OVERLAY_STORAGE_KEY);
      } else {
        window.localStorage.setItem(
          AR_OVERLAY_STORAGE_KEY,
          JSON.stringify({ history, cursor }),
        );
      }
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [history, cursor]);

  useEffect(() => () => stop(), [stop]);

  const arOverlay = cursor >= 0 ? history[cursor] : null;
  const canUndoAR = cursor > -1;
  const canRedoAR = cursor < history.length - 1;

  const value = useMemo<CameraContextValue>(
    () => ({
      stream,
      active: !!stream,
      error,
      starting,
      start,
      stop,
      arOverlay,
      setAROverlay,
      clearAROverlay,
      canUndoAR,
      canRedoAR,
      undoAR,
      redoAR,
      arHistoryLength: history.length,
      arHistoryIndex: cursor,
    }),
    [
      stream,
      error,
      starting,
      start,
      stop,
      arOverlay,
      setAROverlay,
      clearAROverlay,
      canUndoAR,
      canRedoAR,
      undoAR,
      redoAR,
      history.length,
      cursor,
    ],
  );

  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}

export function useCamera() {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error("useCamera must be used within CameraProvider");
  return ctx;
}
