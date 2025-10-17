/**
 * useValidLinks Hook
 *
 * Filters out empty social links for preview components
 */

import { useMemo } from "react";

interface SocialLink {
  platform: string;
  url: string;
}

export function useValidLinks(socialLinks: SocialLink[]) {
  const validLinks = useMemo(
    () => socialLinks.filter((link) => link.url.trim()),
    [socialLinks]
  );

  return validLinks;
}
