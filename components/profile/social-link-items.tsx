"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";
import type { Database } from "@/types/database.types";
import { getSocialIcon } from "@/lib/preview/actions";
import { getPlaceholder } from "@/lib/profile/actions";
import { SAVED_INDICATOR_DELAY } from "./constants";
import { useSocialLinkMutation } from "./hooks/useSocialLinkMutation";

type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialLinkItemProps {
  storeId: string;
  platform: string;
  platformLabel: string;
  existingLink?: SocialLink;
}

export function SocialLinkItem({
  storeId,
  platform,
  platformLabel,
  existingLink,
}: SocialLinkItemProps) {
  const [url, setUrl] = useState(existingLink?.url || "");
  const [isSaved, setIsSaved] = useState(false);

  const { saveSocialLink, deleteSocialLink, isPending } = useSocialLinkMutation({
    platformLabel,
    onSuccess: () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), SAVED_INDICATOR_DELAY);
    },
  });

  const Icon = getSocialIcon(platform);
  const placeholder = getPlaceholder(platform);

  const handleSave = async () => {
    if (!url.trim()) {
      // If URL is empty and link exists, delete it
      if (existingLink) {
        await handleDelete();
      }
      return;
    }

    await saveSocialLink({
      storeId,
      platform,
      url: url.trim(),
      handle: extractHandle(url.trim()),
    });
  };

  const handleDelete = async () => {
    if (!existingLink) return;

    const success = await deleteSocialLink(existingLink.id);
    if (success) {
      setUrl("");
    }
  };

  // Extract handle from URL
  const extractHandle = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const handle = pathname.split("/").filter(Boolean).pop() || "";
      return handle.replace("@", "");
    } catch {
      return "";
    }
  };

  // Check if URL has changed
  const hasChanged = url.trim() !== (existingLink?.url || "");

  return (
    <div className="space-y-2">
      <Label htmlFor={platform} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {platformLabel}
      </Label>

      <div className="flex gap-2">
        <Input
          id={platform}
          type="text"
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isPending}
        />

        {hasChanged && (
          <Button
            type="button"
            size="icon"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        )}

        {existingLink && !hasChanged && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
