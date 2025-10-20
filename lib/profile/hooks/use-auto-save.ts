/**
 * useAutoSave Hook
 *
 * Automatically saves form data after a delay when values change
 */

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface UseAutoSaveParams<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveParams<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedData = useDebounce(data, delay);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip auto-save on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Skip if auto-save is disabled
    if (!enabled) return;

    const save = async () => {
      setIsSaving(true);
      try {
        await onSave(debouncedData);
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedData, enabled, onSave]);

  return {
    isSaving,
    lastSaved,
  };
}
