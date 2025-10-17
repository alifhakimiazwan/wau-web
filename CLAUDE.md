# Next.js 15.3 + Supabase + TypeScript Best Practices

## 🚀 Core Principles

### 1. Type Generation is Non-Negotiable

```bash
# After ANY schema change:
supabase gen types --local > types/database.types.ts

# Automate with git hooks:
# .husky/pre-commit
if git diff --cached --name-only | grep -q "supabase/migrations"; then
  npm run types:generate
  git add types/database.types.ts
fi
```

### 2. Server-First Architecture (Next.js 15.3)

```typescript
// ✅ Server Components by default
export default async function Page() {
  const data = await getServerData(); // Direct DB calls
  return <ClientComponent initialData={data} />;
}

// ✅ Use after() for non-blocking operations
import { after } from "next/server";

export async function createPost(data: PostInput) {
  const post = await db.posts.create(data);

  after(async () => {
    // Non-blocking: analytics, cache warming, webhooks
    await trackEvent("post_created", { postId: post.id });
    await sendNotification(post.authorId);
  });

  return post;
}
```

### 3. Supabase Client Separation

```typescript
// lib/supabase/client.ts - Browser only
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts - Server only
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server component - can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server component - can't remove cookies
          }
        },
      },
    }
  );
}
```

### Supabase Migration-First Development

When working with Supabase databases, **ALWAYS** use migrations for ANY schema changes:

### Core Rules

1. **NEVER modify the database directly** - No manual CREATE TABLE, ALTER TABLE, etc.
2. **ALWAYS create a migration file** for schema changes:

   ```bash
   supabase migration new descriptive_name_here
   ```

3. **Migration naming convention**:

   - `create_[table]_table` - New tables
   - `add_[column]_to_[table]` - New columns
   - `update_[table]_[change]` - Modifications
   - `create_[name]_index` - Indexes
   - `add_[table]_rls` - RLS policies

4. **After EVERY migration**:
   ```bash
   supabase db reset                          # Apply locally
   supabase gen types --local > types/database.types.ts  # Update types
   ```
5. **Example workflow for adding a field**:

   ```bash
   # Wrong ❌
   ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;

   # Right ✅
   supabase migration new add_views_to_posts
   # Then write SQL in the generated file
   # Then: supabase db reset && npm run db:types
   ```

6. **Include in EVERY migration**:

   - Enable RLS on new tables
   - Add proper indexes
   - Consider adding triggers for updated_at

7. **Commit both**:

   - Migration file (`supabase/migrations/*.sql`)
   - Updated types (`types/database.types.ts`)

This ensures reproducible database states across all environments and team members.

## 📁 Project Structure (Next.js 15.3 + Supabase)

```
├── app/                      # App Router
│   ├── (auth)/              # Auth group routes
│   ├── (dashboard)/         # Protected routes
│   ├── api/                 # API routes
│   └── globals.css          # Tailwind v4
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── features/            # Feature components
├── lib/
│   ├── supabase/           # Client configs
│   └── utils.ts            # cn() + helpers
├── server/                  # Server-only code
│   ├── queries/            # DB queries
│   └── actions/            # Server Actions
├── hooks/                   # Client hooks
├── test/                    # Test utilities
│   └── setup.ts            # Vitest setup
├── types/
│   └── database.types.ts   # Generated types from Supabase
└── supabase/
    ├── migrations/         # Database migrations
    └── config.toml         # Supabase configuration
```

## 🎯 Next.js 15.3 Patterns

### Server Actions with Revalidation

```typescript
// server/actions/posts.ts
"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { after } from "next/server";

export async function createPost(formData: PostInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .insert(formData)
    .select()
    .single();

  if (error) throw error;

  // Immediate revalidation
  revalidateTag("posts");
  revalidatePath("/dashboard");

  // Deferred operations
  after(async () => {
    await notifySubscribers(data.id);
  });

  return data;
}
```

### Form Component with Prefetching

```typescript
// Using Next.js 15.3 stable Form component
import Form from "next/form";

export function SearchForm() {
  return (
    <Form action="/search" prefetch={true}>
      <input name="q" placeholder="Search..." />
      <button type="submit">Search</button>
    </Form>
  );
}
```

### Connection API for Performance

```typescript
// Warm connections early for better performance
import { connection } from "next/server";

export default async function Layout({ children }) {
  // Pre-warm database connection
  await connection();

  // Pre-connect to external services
  await fetch("https://api.service.com/warmup", {
    method: "HEAD",
  });

  return <>{children}</>;
}
```

## ✅ Input Validation with Zod

Always validate user input using Zod schemas before processing:

```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
```

### Using Validation in Server Actions

```typescript
'use server'

import { loginSchema } from '@/lib/validations/auth'

export async function login(formData: FormData) {
  try {
    // Parse and validate - throws ZodError if invalid
    const data = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    // data is now type-safe and validated
    // Proceed with authentication...
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors[0].message
      }
    }
    throw error
  }
}
```

## 🔐 Authentication & Authorization Patterns

### Supabase Auth with Server Actions

```typescript
// lib/auth/actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema } from '@/lib/validations/auth'

export async function login(formData: FormData) {
  try {
    const data = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const supabase = await createServerSupabaseClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // Map Supabase errors to user-friendly messages
      if (error.message === 'Invalid login credentials') {
        return {
          success: false,
          error: 'Invalid email and password. Please try again.'
        }
      }
      return { success: false, error: error.message }
    }

    // Revalidate and redirect
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error: any) {
    // Handle redirect (Next.js throws NEXT_REDIRECT)
    if (error.message === 'NEXT_REDIRECT') throw error

    return {
      success: false,
      error: error.message || 'An unexpected error occurred.'
    }
  }
}

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

### Route Protection Guards

Create reusable guards for protecting routes and checking onboarding status:

```typescript
// lib/guards/onboarding-guard.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Ensures user is authenticated.
 * Redirects to /login if not.
 */
export async function requireAuth() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return { user }
}

/**
 * Ensures user has completed onboarding (has a store).
 * Redirects to /onboarding if not.
 */
export async function requireStore() {
  const { user } = await requireAuth()
  const supabase = await createServerSupabaseClient()

  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !store) {
    redirect('/onboarding')
  }

  return { user, store }
}

/**
 * Prevents access to onboarding if user already has a store.
 * Redirects to /dashboard if store exists.
 */
export async function preventCompletedOnboarding() {
  const { user } = await requireAuth()
  const supabase = await createServerSupabaseClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (store) {
    redirect('/dashboard')
  }

  return { user }
}
```

### Usage in Layouts

```typescript
// app/(dashboard)/layout.tsx
import { requireStore } from '@/lib/guards/onboarding-guard'

export default async function DashboardLayout({ children }) {
  // Automatically redirects if user isn't authenticated or has no store
  const { user, store } = await requireStore()

  return (
    <SidebarProvider>
      <AppSidebar user={user} store={store} />
      <main>{children}</main>
    </SidebarProvider>
  )
}

// app/onboarding/layout.tsx
import { preventCompletedOnboarding } from '@/lib/guards/onboarding-guard'

export default async function OnboardingLayout({ children }) {
  // Prevents users who already have a store from accessing onboarding
  await preventCompletedOnboarding()

  return <>{children}</>
}
```

## 🏪 Multi-Tenancy & Store Patterns

### Store-Scoped Queries

Always scope queries to the authenticated user's store:

```typescript
// lib/profile/actions.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireStore } from '@/lib/guards/onboarding-guard'

export async function updateStoreProfile(formData: FormData) {
  // Automatically ensures user has a store
  const { user, store } = await requireStore()
  const supabase = await createServerSupabaseClient()

  const updates = {
    name: formData.get('name'),
    bio: formData.get('bio'),
    location: formData.get('location'),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', store.id)        // ✅ Scope to user's store
    .eq('user_id', user.id)     // ✅ Extra security layer
    .select()
    .single()

  if (error) throw error

  revalidatePath('/store/profile')
  return { success: true, data }
}
```

### RLS Policies for Multi-Tenancy

```sql
-- supabase/migrations/xxx_add_stores_rls.sql

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Users can only read their own store
CREATE POLICY "Users can view own store" ON stores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own store
CREATE POLICY "Users can update own store" ON stores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own store (onboarding)
CREATE POLICY "Users can create own store" ON stores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- For public store profiles (accessible by slug)
CREATE POLICY "Public stores viewable by slug" ON stores
  FOR SELECT
  USING (is_published = true);
```

## 🎨 UI Components (shadcn/ui + Tailwind v4)

### Tailwind v4 Configuration

```css
/* app/globals.css */
@import "tailwindcss";

/* Define design tokens in @theme */
@theme {
  --color-primary: oklch(24% 0.15 256);
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(10% 0 0);

  --font-sans: "Inter", system-ui, sans-serif;
  --radius: 0.5rem;
}

/* No more @tailwind directives or @layer needed */
```

### Custom Fonts Setup (Google Fonts + Local Fonts)

```typescript
// app/layout.tsx
import { DM_Sans } from "next/font/google"
import localFont from "next/font/local"

// Google Font
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
})

// Local Font
const stratford = localFont({
  src: [
    {
      path: "../public/fonts/Stratford-Serial Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-stratford",
  display: "swap",
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${stratford.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

```css
/* app/globals.css - Map to Tailwind */
@theme inline {
  --font-sans: var(--font-dm-sans);
  --font-serif: var(--font-stratford);
  --font-mono: JetBrains Mono, monospace;
}
```

### Typography Component with Font Variants

```typescript
// components/ui/typography.tsx
import { cva, type VariantProps } from "class-variance-authority"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      p: "leading-7",
      muted: "text-sm text-muted-foreground",
    },
    font: {
      sans: "font-sans",   // DM Sans
      serif: "font-serif", // Stratford
      mono: "font-mono",   // JetBrains Mono
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

export function Typography({ variant, font, className, ...props }) {
  return (
    <p
      className={cn(typographyVariants({ variant, font }), className)}
      {...props}
    />
  )
}

// Usage
<Typography variant="h1" font="serif">Stratford Heading</Typography>
<Typography variant="p" font="sans">DM Sans paragraph</Typography>
```

### Component Setup

```bash
# Initialize shadcn/ui with Tailwind v4
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add button form card toast
```

```typescript
// Feature component using shadcn/ui
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function PostCard({ post }: { post: Post }) {
  const { toast } = useToast();

  async function handleLike() {
    const result = await likePost(post.id);

    toast({
      title: result.success ? "Liked!" : "Error",
      variant: result.success ? "default" : "destructive",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>{post.content}</CardContent>
      <CardFooter>
        <Button onClick={handleLike}>Like</Button>
      </CardFooter>
    </Card>
  );
}
```

## 🔥 Real-time Subscriptions

```typescript
// hooks/use-realtime.ts
export function useRealtime<T extends keyof Database["public"]["Tables"]>(
  table: T,
  filter?: string
) {
  const [data, setData] = useState<Tables<T>[]>([]);
  const supabase = createClient(); // Client-side only

  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setData((prev) => [payload.new as Tables<T>, ...prev]);
          }
          // Handle UPDATE, DELETE
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [table, filter]);

  return data;
}
```

## 📱 Preview & Design System Patterns

### Live Preview with Sheet Component

Create real-time preview components that update as users customize their design:

```typescript
// components/preview/preview-sheet.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Eye } from "lucide-react"
import { DeviceMockup } from "./device-mockup"
import { StorefrontPreview } from "./storefront-preview"

interface PreviewSheetProps {
  name: string
  bio?: string
  profilePicUrl?: string
  theme?: string
  colors?: {
    primary: string
    accent: string
  }
  buttonConfig?: ButtonStyle
}

export function PreviewSheet(props: PreviewSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          type="button" // ⭐ Prevent form submission in forms
          className="gap-2"
        >
          <Eye className="h-5 w-5" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Live Preview</SheetTitle>
        </SheetHeader>

        {/* Center the mockup */}
        <div className="flex justify-center pb-8">
          <DeviceMockup>
            <StorefrontPreview {...props} />
          </DeviceMockup>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Device Mockup Component

```typescript
// components/preview/device-mockup.tsx
export function IPhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto border-[14px] border-gray-800 rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
      {/* Notch */}
      <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-800 absolute -right-[17px] top-[124px] rounded-r-lg" />

      {/* Screen */}
      <div className="rounded-[2rem] overflow-hidden h-[572px] w-[272px] bg-white">
        {children}
      </div>
    </div>
  )
}
```

### Controlled Form Inputs with Live Preview

Pattern for syncing form state with preview in real-time:

```typescript
// components/store/store-design-form.tsx
"use client"

import { useState } from "react"
import { PreviewSheet } from "@/components/preview/preview-sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StoreDesignForm({ initialData }) {
  const [formState, setFormState] = useState(initialData)

  return (
    <form>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Store Name</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <Input
            id="primaryColor"
            type="color"
            value={formState.colors.primary}
            onChange={(e) =>
              setFormState({
                ...formState,
                colors: { ...formState.colors, primary: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Preview updates in real-time */}
      <PreviewSheet {...formState} />
    </form>
  )
}
```

### Theme Configuration Type System

```typescript
// lib/design/types.ts
export interface ButtonStyle {
  variant: "solid" | "outline" | "ghost"
  roundness: "square" | "rounded" | "pill"
  shadow: "none" | "sm" | "md" | "lg"
}

export interface ThemeConfig {
  colors: {
    primary: string
    accent: string
    background: string
    foreground: string
  }
  fonts: {
    heading: "sans" | "serif" | "mono"
    body: "sans" | "serif" | "mono"
  }
  spacing: {
    blockGap: number
    padding: number
  }
  borderRadius: number
}

export interface StoreDesign {
  theme: string
  customTheme?: ThemeConfig
  buttonConfig: ButtonStyle
  blockShape: "square" | "rounded" | "pill"
}
```

### Server Action for Theme Updates

```typescript
// lib/design/actions.ts
'use server'

import { requireStore } from '@/lib/guards/onboarding-guard'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDesign(formData: FormData) {
  const { store } = await requireStore()
  const supabase = await createServerSupabaseClient()

  const buttonConfig = {
    variant: formData.get('buttonVariant'),
    roundness: formData.get('buttonRoundness'),
    shadow: formData.get('buttonShadow'),
  }

  const { error } = await supabase
    .from('stores')
    .update({
      theme: formData.get('theme'),
      button_config: buttonConfig,
      updated_at: new Date().toISOString(),
    })
    .eq('id', store.id)

  if (error) throw error

  revalidatePath('/store/design')
  return { success: true }
}
```

## 🧪 Testing Infrastructure (Vitest)

### When to Test

- **Business logic** in utilities and hooks
- **Server Actions** with mocked Supabase client
- **Component behavior** not visual appearance
- **Error states** and edge cases

### Setup

```bash
npm i -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});

// test/setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    },
  }),
}));
```

### Testing Patterns

```typescript
// components/features/posts/__tests__/post-card.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCard } from "../post-card";

describe("PostCard", () => {
  const mockPost = {
    id: "1",
    title: "Test Post",
    content: "Test content",
    author: { name: "John" },
  };

  it("renders post content", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("calls onLike when like button clicked", async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();

    render(<PostCard post={mockPost} onLike={onLike} />);
    await user.click(screen.getByRole("button", { name: /like/i }));

    expect(onLike).toHaveBeenCalledWith(mockPost.id);
  });
});

// server/actions/__tests__/posts.test.ts
import { createPost } from "../posts";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server");

describe("createPost", () => {
  it("creates post and returns data", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: "1", title: "New Post" },
              error: null,
            })),
          })),
        })),
      })),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const result = await createPost({ title: "New Post", content: "Content" });
    expect(result).toEqual({ id: "1", title: "New Post" });
  });

  it("throws error on database failure", async () => {
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error("Database error"),
            })),
          })),
        })),
      })),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    await expect(
      createPost({ title: "Test", content: "Test" })
    ).rejects.toThrow("Database error");
  });
});
```

## 📊 Database Patterns

### Type-Safe Queries

```typescript
// server/queries/posts.ts
import type { Database } from "@/types/database.types";

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export async function getPosts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!inner(username, avatar_url)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
```

### Row Level Security

```sql
-- Always enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public read, authenticated write
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true);

CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

## 🚀 Performance Optimization

### Parallel Data Loading

```typescript
// Load data in parallel in Server Components
export default async function DashboardPage() {
  const [posts, profile, stats] = await Promise.all([
    getPosts(),
    getProfile(),
    getStats(),
  ]);

  return <Dashboard posts={posts} profile={profile} stats={stats} />;
}
```

### Streaming with Suspense

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />
      </Suspense>
    </>
  );
}

async function PostsList() {
  const posts = await getPosts(); // This can be slow
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </>
  );
}
```

## 🔧 Development Workflow

### Essential Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "db:types": "supabase gen types --local > types/database.types.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

### Environment Variables

```typescript
// lib/env.ts - Validated env vars
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

## ⚡ Key Commands

```bash
# Development
npm run dev --turbo          # Fast refresh with Turbopack
supabase start              # Local Supabase

# Testing
npm run test                # Run tests in watch mode
npm run test:ui            # Open Vitest UI
npm run test:coverage      # Generate coverage report

# Database
supabase db reset           # Reset + migrate
supabase gen types --local > types/database.types.ts

# UI Components
npx shadcn@latest add       # Add components

# Production
npm run build              # Type-safe build
supabase db push          # Deploy migrations
```

## 🎯 Project-Specific Workflow

### Adding a New Feature

1. **Database Changes First**
   ```bash
   # Create migration
   supabase migration new add_feature_name

   # Write SQL with RLS policies
   # Apply locally
   supabase db reset

   # Generate types
   supabase gen types --local > types/database.types.ts
   ```

2. **Server Actions**
   ```typescript
   // lib/[feature]/actions.ts
   'use server'

   import { requireStore } from '@/lib/guards/onboarding-guard'
   import { createServerSupabaseClient } from '@/lib/supabase/server'

   export async function createFeature(formData: FormData) {
     const { user, store } = await requireStore()
     // Implementation with proper RLS scoping
   }
   ```

3. **UI Components**
   ```bash
   # Add shadcn components if needed
   npx shadcn@latest add [component-name]

   # Create feature components
   # components/[feature]/feature-form.tsx
   # components/[feature]/feature-list.tsx
   ```

4. **Testing**
   ```bash
   # Write tests
   npm run test

   # Check coverage
   npm run test:coverage
   ```

### Authentication Flow

```
1. User signs up → /signup
2. Email confirmation → /auth/callback
3. First login → Check for store
   - Has store → /dashboard
   - No store → /onboarding
4. Onboarding complete → Create store → /dashboard
5. All dashboard routes protected by requireStore()
```

### Common Patterns

**Reading user's data:**
```typescript
const { store } = await requireStore()
const data = await supabase.from('table').select().eq('store_id', store.id)
```

**Updating user's data:**
```typescript
const { store, user } = await requireStore()
await supabase
  .from('table')
  .update(data)
  .eq('id', itemId)
  .eq('store_id', store.id)  // RLS enforcement
```

**Client-side preview updates:**
```typescript
const [preview, setPreview] = useState(initialData)
// Update preview on form changes
// Submit to server action on save
```

## 🚨 Critical Rules

1. **Always regenerate types after schema changes**
2. **Use Server Components by default, Client Components when needed**
3. **Separate server and client Supabase instances (never import wrong one)**
4. **Use `after()` for non-blocking operations**
5. **Enable RLS on all tables - verify with tests**
6. **Compose UI with shadcn/ui components**
7. **Validate environment variables with Zod**
8. **Use Server Actions for mutations**
9. **Always scope queries to user's store with requireStore()**
10. **Prevent form submission on preview buttons (type="button")**
11. **Handle NEXT_REDIRECT errors in try-catch blocks**
12. **Revalidate paths after mutations**
13. **Use maybeSingle() when expecting 0 or 1 row**
14. **Map Supabase errors to user-friendly messages**
15. **Test business logic, not implementation details**

## 📋 Pre-deployment Checklist

- [ ] All migrations applied and types generated
- [ ] RLS policies tested for all tables
- [ ] Environment variables validated
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Auth guards on all protected routes
- [ ] Proper error messages for user actions
- [ ] Tests passing with good coverage
- [ ] No console.errors in production build
- [ ] Fonts and assets optimized
