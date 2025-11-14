## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Supabase Locally

```bash
supabase start
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
├── api/              # API routes (RESTful)
│   ├── profile/      # Profile management
│   ├── store/        # Store customization
│   └── products/     # Product uploads
├── (auth)/           # Auth pages (login, signup)
└── (dashboard)/      # Protected routes

components/
├── ui/               # shadcn/ui components
├── product-cards/    # Reusable product card components
├── storefront/       # Public storefront layouts
├── profile/          # Profile components
├── products/         # Product form components
└── dashboard/        # Dashboard components

lib/
├── supabase/         # Supabase clients
├── guards/           # Auth helpers
├── theme/            # Theme & design utilities
├── axios.ts          # Axios config
└── utils.ts          # Utilities

supabase/
└── migrations/       # Database migrations

docs/
└── API.md            # API documentation
```

---

## Key Commands

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start dev server (with Turbopack) |
| `npm run build`     | Production build                  |
| `npm test`          | Run tests                         |
| `supabase start`    | Start local Supabase              |
| `supabase db reset` | Reset & apply migrations          |
| `npm run db:types`  | Generate TypeScript types from DB |

---

## Working with the Database

**ALWAYS use migrations for schema changes:**

```bash
# 1. Create migration
supabase migration new add_something

# 2. Write SQL in the generated file

# 3. Apply migration
supabase db reset

# 4. Generate types
npm run db:types
```

See `CLAUDE.md` for detailed database patterns.

---

## API Development

**See [docs/API.md](./docs/API.md) for complete API reference.**

---

## Authentication

Routes automatically check:

- ✅ User is logged in
- ✅ User owns the resource
- ✅ User has completed onboarding

Use helpers:

```typescript
// For routes needing user + store
import { requireStore } from "@/lib/guards/onboarding-guard";

export default async function Page() {
  const { user, store } = await requireStore(); // Auto-redirects if needed
  // ...
}
```

```typescript
// For server actions/API routes
import { getAuthUserWithStore } from "@/lib/guards/auth-helpers";

export async function updateProfile() {
  const authResult = await getAuthUserWithStore();
  if (!authResult.success) {
    return { success: false, error: authResult.error };
  }
  // ...
}
```

---

## Common Tasks

### Adding a New API Route

1. Create `/app/api/resource/route.ts`
2. Export HTTP method functions (GET, POST, PUT, DELETE)
3. Use auth helpers
4. Return `{ success: boolean, ... }`

```typescript
import { NextResponse } from "next/server";
import { getAuthUserWithStore } from "@/lib/guards/auth-helpers";

export async function PUT(request: Request) {
  const authResult = await getAuthUserWithStore();
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    );
  }

  // Your logic here
  return NextResponse.json({ success: true });
}
```

### Making API Calls

Always use `axios`:

```typescript
import axios from "axios";

const { data } = await axios.put("/api/profile", {
  name: "Store Name",
});

if (data.success) {
  // Success
}
```

### Adding UI Components

```bash
# Add shadcn component
npx shadcn@latest add button
```

## Development Workflow

1. **Pull latest changes**

   ```bash
   git pull
   ```

2. **Apply migrations & update types**

   ```bash
   supabase db reset
   npm run db:types
   ```

3. **Start development**

   ```bash
   npm run dev
   ```

4. **Make changes**
   - Follow patterns in `CLAUDE.md`
   - Use existing helpers (don't duplicate)
   - Test locally

5. **Commit**
   ```bash
   git add .
   git commit -m "feat: add feature"
   git push
   ```

---

## Common Issues

**"Not authenticated" error**

- Make sure you're logged in
- Check if session is expired

**"Store not found" error**

- Complete onboarding first at `/onboarding`

**Type errors after migration**

- Run `npm run db:types`

**Supabase not running**

- Run `supabase start`

---

**Questions?** Ask the team! 🚀
