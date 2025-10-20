/**
 * useOptimisticUpdate Hook
 *
 * Provides optimistic UI updates - instantly updates UI before server confirmation
 * Rolls back on error for better UX
 */

import { useState, useCallback } from "react";

interface UseOptimisticUpdateParams<T> {
  initialData: T;
  onUpdate: (data: T) => Promise<void>;
}

export function useOptimisticUpdate<T>({
  initialData,
  onUpdate,
}: UseOptimisticUpdateParams<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (newData: T) => {
      // Store previous data for rollback
      const previousData = data;

      // Optimistically update UI
      setData(newData);
      setIsPending(true);
      setError(null);

      try {
        // Attempt server update
        await onUpdate(newData);
        setIsPending(false);
      } catch (err) {
        // Rollback on error
        setData(previousData);
        setError(err instanceof Error ? err : new Error("Update failed"));
        setIsPending(false);
        throw err;
      }
    },
    [data, onUpdate]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsPending(false);
  }, [initialData]);

  return {
    data,
    isPending,
    error,
    update,
    reset,
  };
}
