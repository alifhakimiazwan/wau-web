import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  IconMapPin,
  IconPhone,
  IconPencil,
} from "@tabler/icons-react";
import Link from "next/link";
import type { Database } from "@/types/database.types";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface ProfileCardProps {
  store: Store;
  socialLinks?: SocialLink[];
}

// Map platform to icon
const getSocialIcon = (platform: string) => {
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

export function ProfileCard({ store, socialLinks = [] }: ProfileCardProps) {
  // Get initials from name
  const getInitials = () => {
    if (store.name) {
      return store.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return store.slug[0].toUpperCase();
  };

  // Sort social links by position
  const sortedSocialLinks = [...socialLinks].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );

  return (
    <Card className="rounded-4xl py-0 gap-0">
      <CardHeader className="relative gap-0">
        {/* Edit Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          asChild
        >
          <Link href="/store/profile">
            <IconPencil className="h-4 w-4" />
            <span className="sr-only">Edit profile</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="flex gap-4 px-0">
        {/* Avatar */}
        <div className="w-40 aspect-square rounded-4xl border-4 border-background bg-muted flex-shrink-0">
          <Avatar className="h-full w-full rounded-4xl">
            <AvatarImage
              src={store.profile_pic_url || undefined}
              alt={store.name || store.slug}
              className="object-cover"
            />
            <AvatarFallback className="text-lg font-semibold rounded-3xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Section */}
        <div className="flex-1 space-y-1 flex flex-col justify-center px-4">
          {/* Name & Username */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <Typography variant="h3">
              {store.name || "Unnamed Store"}
            </Typography>
            <Badge variant="outline" className="pt-1 w-fit">
              @{store.slug}
            </Badge>
          </div>

          {/* Bio */}
          {store.bio && (
            <div className="space-y-2">
              <Typography variant="p" className="text-sm leading-relaxed">
                {store.bio}
              </Typography>
            </div>
          )}

          {/* Social Links */}
          {sortedSocialLinks.length > 0 && (
            <div className="space-y-3 py-1">
              <div className="flex flex-wrap gap-2">
                {sortedSocialLinks.map((link) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <Button key={link.id} variant="outline" size="icon" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.platform}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
