"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandTiktok,
  IconBrandGithub,
  IconBrandDiscord,
  IconMail,
  IconWorld,
} from "@tabler/icons-react";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database.types";

type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialLinkItemProps {
  storeId: string;
  platform: string;
  platformLabel: string;
  existingLink?: SocialLink;
}

// Get icon for platform
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    facebook: IconBrandFacebook,
    instagram: IconBrandInstagram,
    twitter: IconBrandTwitter,
    linkedin: IconBrandLinkedin,
    youtube: IconBrandYoutube,
    tiktok: IconBrandTiktok,
    github: IconBrandGithub,
    discord: IconBrandDiscord,
    gmail: IconMail,
    portfolio: IconWorld,
    other: IconWorld,
  };

  return iconMap[platform.toLowerCase()] || IconWorld;
};

// Get placeholder for platform
const getPlaceholder = (platform: string) => {
  const placeholders: Record<string, string> = {
    instagram: "https://instagram.com/yourhandle",
    twitter: "https://twitter.com/yourhandle",
    tiktok: "https://tiktok.com/@yourhandle",
    youtube: "https://youtube.com/@yourhandle",
    facebook: "https://facebook.com/yourpage",
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    discord: "https://discord.gg/yourinvite",
    gmail: "your@email.com",
    portfolio: "https://yourwebsite.com",
    other: "https://...",
  };

  return placeholders[platform] || "https://...";
};

export function SocialLinkItem({
  storeId,
  platform,
  platformLabel,
  existingLink,
}: SocialLinkItemProps) {
  const [url, setUrl] = useState(existingLink?.url || "");
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  const Icon = getPlatformIcon(platform);
  const placeholder = getPlaceholder(platform);

  const handleSave = async () => {
    if (!url.trim()) {
      // If URL is empty and link exists, delete it
      if (existingLink) {
        await handleDelete();
      }
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/social-links/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId,
            platform,
            url: url.trim(),
            handle: extractHandle(url.trim()),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setIsSaved(true);
          toast.success(`${platformLabel} link saved!`);
          router.refresh();

          // Reset saved indicator after 2 seconds
          setTimeout(() => setIsSaved(false), 2000);
        } else {
          toast.error(result.error || "Failed to save link");
        }
      } catch (error) {
        toast.error("Failed to save link");
      }
    });
  };

  const handleDelete = async () => {
    if (!existingLink) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/social-links/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existingLink.id }),
        });

        const result = await response.json();

        if (result.success) {
          setUrl("");
          toast.success(`${platformLabel} link removed`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete link");
        }
      } catch (error) {
        toast.error("Failed to delete link");
      }
    });
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
