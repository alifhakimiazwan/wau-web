"use client";

import { useTransition, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
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
import type { Database } from "@/types/database.types";
import { ImageUpload } from "./image-upload";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface ProfileFormProps {
  store: Store;
  socialLinks: SocialLink[];
}

// ⭐ Unified schema with social links
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  location: z.string().optional(),
  phone_number: z.string().optional(),
  profile_pic_url: z.string().optional(),
  banner_pic_url: z.string().optional(),
  socialLinks: z.array(
    z.object({
      id: z.string().optional(),
      platform: z.string(),
      url: z.string().url("Invalid URL").or(z.literal("")),
    })
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Available platforms
const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: IconBrandInstagram },
  { value: "twitter", label: "Twitter/X", icon: IconBrandTwitter },
  { value: "tiktok", label: "TikTok", icon: IconBrandTiktok },
  { value: "youtube", label: "YouTube", icon: IconBrandYoutube },
  { value: "facebook", label: "Facebook", icon: IconBrandFacebook },
  { value: "linkedin", label: "LinkedIn", icon: IconBrandLinkedin },
  { value: "github", label: "GitHub", icon: IconBrandGithub },
  { value: "discord", label: "Discord", icon: IconBrandDiscord },
  { value: "gmail", label: "Email", icon: IconMail },
  { value: "portfolio", label: "Website", icon: IconWorld },
];

export function ProfileForm({ store, socialLinks }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [profilePicUrl, setProfilePicUrl] = useState(
    store.profile_pic_url || ""
  );
  const [bannerPicUrl, setBannerPicUrl] = useState(store.banner_pic_url || "");

  // ⭐ Single form state for everything
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: store.name || "",
      bio: store.bio || "",
      location: store.location || "",
      phone_number: store.phone_number || "",
      profile_pic_url: store.profile_pic_url || "",
      banner_pic_url: store.banner_pic_url || "",
      socialLinks: socialLinks.map((link) => ({
        id: link.id,
        platform: link.platform,
        url: link.url,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const getPlatformInfo = (platformValue: string) => {
    return PLATFORMS.find((p) => p.value === platformValue) || PLATFORMS[0];
  };

  const availablePlatforms = PLATFORMS.filter(
    (platform) => !fields.some((field) => field.platform === platform.value)
  );

  const onSubmit = async (data: ProfileFormData) => {
    startTransition(async () => {
      try {
        // Filter out empty URLs
        const validLinks = data.socialLinks.filter((link) => link.url.trim());

        const response = await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            socialLinks: validLinks,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Profile updated successfully!");
          reset(data); // Reset form with new values
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Failed to update profile");
      }
    });
  };

  // Handle cancel
  const handleCancel = () => {
    reset();
    router.push("/store");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 m-6">
      {/* Images Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
          <CardDescription>
            Upload your profile picture and banner image
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <ImageUpload
              type="avatar"
              currentImageUrl={profilePicUrl}
              storeSlug={store.slug}
              storeName={store.name || undefined}
              onUploadComplete={(url) => {
                setProfilePicUrl(url);
                setValue("profile_pic_url", url, { shouldDirty: true });
              }}
            />
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <ImageUpload
              type="banner"
              currentImageUrl={bannerPicUrl}
              storeSlug={store.slug}
              storeName={store.name || undefined}
              onUploadComplete={(url) => {
                setBannerPicUrl(url);
                setValue("banner_pic_url", url, { shouldDirty: true });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your store name, bio, and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Store Name *</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={isPending}
              placeholder="My Awesome Store"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              disabled={isPending}
              placeholder="Tell your customers about yourself..."
              rows={4}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              A short description (max 160 characters)
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register("location")}
              disabled={isPending}
              placeholder="Kuala Lumpur, Malaysia"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              {...register("phone_number")}
              disabled={isPending}
              placeholder="+60 12-345 6789"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>
            Add your social media profiles and website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Links */}
          {fields.map((field, index) => {
            const platformInfo = getPlatformInfo(field.platform);
            const Icon = platformInfo.icon;

            return (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {platformInfo.label}
                </Label>
                <div className="flex gap-2">
                  <Input
                    {...register(`socialLinks.${index}.url`)}
                    disabled={isPending}
                    placeholder={`https://${field.platform}.com/yourhandle`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {errors.socialLinks?.[index]?.url && (
                  <p className="text-sm text-destructive">
                    {errors.socialLinks[index]?.url?.message}
                  </p>
                )}
              </div>
            );
          })}

          {/* Add New Link */}
          {availablePlatforms.length > 0 && (
            <div className="pt-4">
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          platform: platform.value,
                          url: "",
                        })
                      }
                      disabled={isPending}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      Add {platform.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No links message */}
          {fields.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Typography variant="small">
                No social links added yet. Click the buttons above to add your
                profiles.
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
