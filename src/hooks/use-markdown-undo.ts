import { useCallback, useEffect, useRef } from "react";

const MAX_HISTORY = 40;
const BURST_MS = 650;

/**
 * Debounced undo stack for Markdown textarea: first keystroke in a burst snapshots
 * previous value; toolbar actions call `commitSnapshot` then mutate via `onChange`.
 */
export function useMarkdownUndo(value: string, onChange: (next: string) => void) {
  const past = useRef<string[]>([]);
  const future = useRef<string[]>([]);
  const valueRef = useRef(value);
  const burstOpen = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const endBurst = useCallback(() => {
    burstOpen.current = false;
  }, []);

  const onUserInput = useCallback(
    (next: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!burstOpen.current) {
        past.current.push(valueRef.current);

        if (past.current.length > MAX_HISTORY) {
          past.current.shift();
        }

        future.current = [];
        burstOpen.current = true;
      }

      debounceRef.current = setTimeout(endBurst, BURST_MS);
      onChange(next);
    },
    [onChange, endBurst]
  );

  const commitSnapshot = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    burstOpen.current = false;
    past.current.push(valueRef.current);

    if (past.current.length > MAX_HISTORY) {
      past.current.shift();
    }

    future.current = [];
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) {
      return;
    }

    const prev = past.current.pop()!;
    future.current.push(valueRef.current);
    burstOpen.current = false;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    onChange(prev);
  }, [onChange]);

  const redo = useCallback(() => {
    if (future.current.length === 0) {
      return;
    }

    const next = future.current.pop()!;
    past.current.push(valueRef.current);
    burstOpen.current = false;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    onChange(next);
  }, [onChange]);

  return { onUserInput, commitSnapshot, undo, redo };
}
