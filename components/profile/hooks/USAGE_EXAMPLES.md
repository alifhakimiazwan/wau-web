# Custom Hooks Usage Guide

Complete guide with real-world examples for all profile hooks.

---

## 1. `useSocialLinkMutation` - Already Implemented ✅

**Location**: `components/profile/social-link-items.tsx`

**Current Usage**:
```typescript
const { saveSocialLink, deleteSocialLink, isPending } = useSocialLinkMutation({
  platformLabel: "Instagram",
  onSuccess: () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), SAVED_INDICATOR_DELAY);
  },
});

// Save
await saveSocialLink({
  storeId: "123",
  platform: "instagram",
  url: "https://instagram.com/user",
  handle: "user"
});

// Delete
await deleteSocialLink(linkId);
```

---

## 2. `useImageUpload` - Already Implemented ✅

**Location**: `components/profile/image-upload.tsx`

**Current Usage**:
```typescript
const {
  isUploading,
  previewUrl,
  fileInputRef,
  handleFileSelect,
  handleDrop,
  removeImage,
  triggerFileSelect,
} = useImageUpload({
  type: "avatar",
  currentImageUrl: "/profile.jpg",
  onUploadComplete: (url) => {
    setValue("profile_pic_url", url);
  }
});

// File input
<input
  ref={fileInputRef}
  type="file"
  onChange={handleFileSelect}
/>

// Trigger upload
<Button onClick={triggerFileSelect}>Upload</Button>

// Drag & drop
<Dropzone onDrop={handleDrop}>...</Dropzone>

// Remove
<Button onClick={removeImage}>Remove</Button>
```

---

## 3. `useDebounce` - Search & Filter Example

### Example 1: Platform Search in Social Links Manager

```typescript
"use client";

import { useState } from "react";
import { useDebounce } from "@/components/profile";

export function SocialLinksManager({ platforms }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Only filters after user stops typing for 300ms
  const filteredPlatforms = platforms.filter(p =>
    p.label.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div>
      <Input
        placeholder="Search platforms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredPlatforms.map(platform => (
        <div key={platform.value}>{platform.label}</div>
      ))}
    </div>
  );
}
```

### Example 2: Auto-save Store Name

```typescript
"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/components/profile";

export function StoreNameInput({ initialName, storeId }) {
  const [name, setName] = useState(initialName);
  const debouncedName = useDebounce(name, 1000);

  // Auto-save 1 second after user stops typing
  useEffect(() => {
    if (debouncedName === initialName) return;

    const saveStoreName = async () => {
      await fetch("/api/store/update-name", {
        method: "POST",
        body: JSON.stringify({ storeId, name: debouncedName })
      });
    };

    saveStoreName();
  }, [debouncedName]);

  return (
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Store name"
    />
  );
}
```

---

## 4. `useAutoSave` - Automatic Form Saving

### Example: Auto-save Bio Field

**Location**: Create `components/profile/auto-save-bio.tsx`

```typescript
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSave } from "@/components/profile";
import { Loader2, Check } from "lucide-react";

interface AutoSaveBioProps {
  storeId: string;
  initialBio: string;
}

export function AutoSaveBio({ storeId, initialBio }: AutoSaveBioProps) {
  const [bio, setBio] = useState(initialBio);

  const { isSaving, lastSaved } = useAutoSave({
    data: { bio },
    onSave: async (data) => {
      await fetch("/api/profile/update-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, bio: data.bio })
      });
    },
    delay: 2000, // Save 2 seconds after typing stops
    enabled: bio !== initialBio, // Only save if changed
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label>Bio</label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {!isSaving && lastSaved && (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span>Saved {formatTimeAgo(lastSaved)}</span>
            </>
          )}
        </div>
      </div>
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell your story..."
      />
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 minute ago";
  return `${minutes} minutes ago`;
}
```

### Example: Auto-save Entire Profile Form

**Update to**: `components/profile/profile-form.tsx`

```typescript
import { useAutoSave } from "@/components/profile";

export function ProfileForm({ store, socialLinks, customization }) {
  const formValues = watch();

  // Auto-save entire form
  const { isSaving, lastSaved } = useAutoSave({
    data: formValues,
    onSave: async (data) => {
      const validLinks = data.socialLinks.filter(link => link.url.trim());

      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, socialLinks: validLinks }),
      });
    },
    delay: 3000,
    enabled: isDirty, // Only save if form has changes
  });

  return (
    <form>
      {/* Show auto-save indicator */}
      <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b">
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving changes...
          </div>
        )}
        {!isSaving && lastSaved && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="h-4 w-4" />
            All changes saved
          </div>
        )}
      </div>

      {/* Rest of form */}
    </form>
  );
}
```

---

## 5. `useFormPersist` - Draft Saving

### Example: Persist Profile Form to LocalStorage

**Update to**: `components/profile/profile-form.tsx`

```typescript
import { useFormPersist } from "@/components/profile";
import { useEffect } from "react";

export function ProfileForm({ store, socialLinks, customization }) {
  const defaultValues = {
    name: store.name || "",
    bio: store.bio || "",
    location: store.location || "",
    socialLinks: socialLinks.map(link => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
    })),
  };

  const {
    loadPersistedData,
    persistData,
    clearPersistedData,
    isRestored,
  } = useFormPersist({
    key: `profile-draft-${store.id}`,
    defaultValues,
    enabled: true,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm({
    defaultValues: isRestored ? loadPersistedData() : defaultValues,
  });

  const formValues = watch();

  // Persist to localStorage on every change
  useEffect(() => {
    persistData(formValues);
  }, [formValues]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Clear draft after successful save
        clearPersistedData();
        toast.success("Profile updated!");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Show draft restoration notice
  useEffect(() => {
    if (isRestored) {
      const hasDraft = localStorage.getItem(`profile-draft-${store.id}`);
      if (hasDraft) {
        toast.info("Draft restored from previous session", {
          action: {
            label: "Discard",
            onClick: () => {
              clearPersistedData();
              reset(defaultValues);
            }
          }
        });
      }
    }
  }, [isRestored]);

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 6. `useOptimisticUpdate` - Instant UI Feedback

### Example 1: Like/Favorite Store

**Create**: `components/store/favorite-button.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useOptimisticUpdate } from "@/components/profile";
import { toast } from "sonner";

interface FavoriteButtonProps {
  storeId: string;
  initialIsFavorited: boolean;
  initialFavoriteCount: number;
}

export function FavoriteButton({
  storeId,
  initialIsFavorited,
  initialFavoriteCount,
}: FavoriteButtonProps) {
  const { data, isPending, update } = useOptimisticUpdate({
    initialData: {
      isFavorited: initialIsFavorited,
      count: initialFavoriteCount,
    },
    onUpdate: async (newData) => {
      const response = await fetch("/api/store/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          isFavorited: newData.isFavorited,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
    },
  });

  const handleToggle = async () => {
    try {
      await update({
        isFavorited: !data.isFavorited,
        count: data.isFavorited ? data.count - 1 : data.count + 1,
      });
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <Button
      variant={data.isFavorited ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 ${data.isFavorited ? "fill-current" : ""}`}
      />
      {data.count}
    </Button>
  );
}
```

### Example 2: Toggle Visibility

**Create**: `components/profile/visibility-toggle.tsx`

```typescript
"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useOptimisticUpdate } from "@/components/profile";

interface VisibilityToggleProps {
  linkId: string;
  initialIsVisible: boolean;
  platformLabel: string;
}

export function VisibilityToggle({
  linkId,
  initialIsVisible,
  platformLabel,
}: VisibilityToggleProps) {
  const { data, isPending, update } = useOptimisticUpdate({
    initialData: { isVisible: initialIsVisible },
    onUpdate: async (newData) => {
      await fetch("/api/social-links/toggle-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, isVisible: newData.isVisible }),
      });
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={data.isVisible}
        onCheckedChange={(checked) => update({ isVisible: checked })}
        disabled={isPending}
      />
      <Label className="text-sm">
        Show {platformLabel} {isPending && "(updating...)"}
      </Label>
    </div>
  );
}
```

---

## Combining Multiple Hooks

### Example: Advanced Form with All Features

```typescript
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useDebounce,
  useAutoSave,
  useFormPersist,
  useOptimisticUpdate,
} from "@/components/profile";

export function AdvancedProfileForm({ storeId, initialData }) {
  // Form state
  const { register, watch, reset } = useForm({ defaultValues: initialData });
  const formValues = watch();

  // Debounce form values for auto-save
  const debouncedValues = useDebounce(formValues, 2000);

  // Persist to localStorage
  const { persistData, clearPersistedData } = useFormPersist({
    key: `profile-${storeId}`,
    defaultValues: initialData,
  });

  // Auto-save to server
  const { isSaving, lastSaved } = useAutoSave({
    data: debouncedValues,
    onSave: async (data) => {
      await fetch("/api/profile/update", {
        method: "POST",
        body: JSON.stringify(data),
      });
      clearPersistedData(); // Clear draft after successful save
    },
    delay: 0, // No additional delay, already debounced
  });

  // Optimistic visibility toggle
  const { data: visibility, update: updateVisibility } = useOptimisticUpdate({
    initialData: { isPublic: initialData.isPublic },
    onUpdate: async (data) => {
      await fetch("/api/profile/visibility", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });

  // Persist on change
  useEffect(() => {
    persistData(formValues);
  }, [formValues]);

  return (
    <div>
      {/* Auto-save indicator */}
      {isSaving && <span>Saving...</span>}
      {lastSaved && <span>Saved at {lastSaved.toLocaleTimeString()}</span>}

      {/* Visibility toggle with optimistic update */}
      <Switch
        checked={visibility.data.isPublic}
        onCheckedChange={(checked) =>
          updateVisibility({ isPublic: checked })
        }
      />

      {/* Form fields with auto-save */}
      <Input {...register("name")} />
      <Textarea {...register("bio")} />
    </div>
  );
}
```

---

## Summary Table

| Hook | Use Case | Delay | Saves Where |
|------|----------|-------|-------------|
| `useDebounce` | Search, filters, auto-save trigger | 300-1000ms | N/A (just delays value) |
| `useAutoSave` | Auto-save forms | 2000-3000ms | Server (API) |
| `useFormPersist` | Draft saving, prevent data loss | Immediate | LocalStorage |
| `useOptimisticUpdate` | Instant UI feedback (likes, toggles) | Immediate | Server (with rollback) |
| `useSocialLinkMutation` | Social link save/delete | On action | Server |
| `useImageUpload` | Image upload/delete | On action | Server + Storage |

---

## Best Practices

1. **Combine hooks** - Use `useDebounce` + `useAutoSave` together
2. **localStorage for drafts** - Use `useFormPersist` to prevent data loss
3. **Optimistic for toggles** - Use `useOptimisticUpdate` for instant feedback
4. **Show indicators** - Always show saving/saved state to users
5. **Clean up drafts** - Clear `localStorage` after successful submission
6. **Error handling** - All hooks handle errors, but show user-friendly messages

---

## Import Statement

```typescript
import {
  useDebounce,
  useAutoSave,
  useFormPersist,
  useOptimisticUpdate,
  useSocialLinkMutation,
  useImageUpload,
} from "@/components/profile";
```
