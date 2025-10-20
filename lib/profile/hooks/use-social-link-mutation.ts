/**
 * useSocialLinkMutation Hook
 *
 * Provides reusable mutations for social link operations (save/delete)
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UseSocialLinkMutationParams {
  platformLabel: string;
  onSuccess?: () => void;
}

export function useSocialLinkMutation({
  platformLabel,
  onSuccess,
}: UseSocialLinkMutationParams) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const saveSocialLink = async (params: {
    storeId: string;
    platform: string;
    url: string;
    handle: string;
  }) => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const response = await fetch("/api/social-links/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });

          const result = await response.json();

          if (result.success) {
            toast.success(`${platformLabel} link saved!`);
            router.refresh();
            onSuccess?.();
            resolve(true);
          } else {
            toast.error(result.error || "Failed to save link");
            resolve(false);
          }
        } catch {
          toast.error("Failed to save link");
          resolve(false);
        }
      });
    });
  };

  const deleteSocialLink = async (linkId: string) => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const response = await fetch("/api/social-links/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: linkId }),
          });

          const result = await response.json();

          if (result.success) {
            toast.success(`${platformLabel} link removed`);
            router.refresh();
            onSuccess?.();
            resolve(true);
          } else {
            toast.error(result.error || "Failed to delete link");
            resolve(false);
          }
        } catch {
          toast.error("Failed to delete link");
          resolve(false);
        }
      });
    });
  };

  return {
    saveSocialLink,
    deleteSocialLink,
    isPending,
  };
}
