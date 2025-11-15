# API Reference

All API routes use **RESTful** design with `axios` for requests.

---

## Quick Reference

| Endpoint            | Method | Purpose              |
| ------------------- | ------ | -------------------- |
| `/api/profile`      | PUT    | Update profile data  |
| `/api/profile`      | POST   | Upload image         |
| `/api/profile`      | DELETE | Delete image         |
| `/api/store/design` | PUT    | Update store design  |
| `/api/products`     | POST   | Upload product files |

---

## Authentication

All routes require authentication. They automatically:

- Check if user is logged in (returns 401 if not)
- Verify user owns the resource (returns 403 if not)
- Return 404 if store doesn't exist

---

## `/api/profile`

### PUT - Update Profile

```typescript
import axios from "axios";

await axios.put("/api/profile", {
  name: "My Store",
  bio: "Optional bio (max 160 chars)",
  location: "Optional location",
  phone_number: "Optional phone",
  profile_pic_url: "url",
  banner_pic_url: "url",
  socialLinks: [
    {
      id: "existing-id", // Include for updates
      platform: "instagram",
      url: "https://instagram.com/user",
    },
    {
      // No id = new link
      platform: "twitter",
      url: "https://twitter.com/user",
    },
  ],
});
```

**Response:** `{ success: true }`

---

### POST - Upload Image

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("type", "avatar"); // or 'banner'
formData.append("oldImageUrl", currentUrl); // optional - deletes old image

const { data } = await axios.post("/api/profile", formData);
// Returns: { success: true, url: 'https://...', path: '...' }
```

**Limits:**

- File types: JPEG, PNG, WebP
- Max size: 10MB

---

### DELETE - Delete Image

```typescript
await axios.delete("/api/profile", {
  params: { imageUrl: "https://..." },
});
```

**Response:** `{ success: true }`

---

## `/api/store/design`

### PUT - Update Design

```typescript
await axios.put("/api/store/design", {
  storeId: store.id,
  design: {
    themeId: "minimal_white",
    fontFamily: "Inter",
    colors: {
      primary: "#000000",
      accent: "#3B82F6",
    },
    blockShape: "rounded", // 'square' | 'rounded' | 'pill'
    buttonConfig: {
      style: "filled", // 'filled' | 'outlined' | 'ghost'
    },
  },
});
```

**Response:** `{ success: true }`

---

## `/api/products`

### POST - Upload Product Files

```typescript
// For product thumbnail
const formData = new FormData();
formData.append("file", imageFile);
formData.append("type", "product_thumbnail");

const { data } = await axios.post("/api/products", formData);
// Returns: { success: true, url: '...', path: '...', filename: '...', size: 123 }
```

```typescript
// For lead magnet file (PDF/ZIP)
const formData = new FormData();
formData.append("file", pdfFile);
formData.append("type", "lead_magnet_file");

const { data } = await axios.post("/api/products", formData);
```

**Limits:**

- `product_thumbnail`: JPEG/PNG/WebP, max 5MB
- `lead_magnet_file`: PDF/ZIP, max 50MB

---

## Error Handling

All responses include `success` field:

```typescript
const { data } = await axios.put("/api/profile", profileData);

if (data.success) {
  // Success
} else {
  // Error
  console.error(data.error);
}
```

**Common Errors:**

| Status | Error                     | Meaning                   |
| ------ | ------------------------- | ------------------------- |
| 400    | `'No file provided'`      | Missing file in FormData  |
| 400    | `'Invalid file type'`     | Wrong file format         |
| 400    | `'File too large'`        | Exceeds size limit        |
| 401    | `'Not authenticated'`     | No user session           |
| 403    | `'Unauthorized'`          | Doesn't own resource      |
| 404    | `'Store not found'`       | Complete onboarding first |
| 500    | `'Internal server error'` | Server/database error     |

---

## Tips

1. **Always use raw axios:**

   ```typescript
   import axios from "axios";

   // ✅ Use raw axios
   await axios.put("/api/profile", data);

   // ❌ Don't use fetch
   await fetch("/api/profile", { method: "PUT", ... });

   // ❌ Don't use api instance (reserved for future)
   import { api } from "@/lib/axios";
   ```

2. **Show user feedback:**

   ```typescript
   import { toast } from "sonner";

   if (data.success) {
     toast.success("Saved!");
   } else {
     toast.error(data.error);
   }
   ```

3. **Handle errors:**
   ```typescript
   try {
     const { data } = await axios.put("/api/profile", profileData);
     if (data.success) {
       // success
     }
   } catch (error) {
     console.error(error);
   }
   ```

---

**Last Updated:** November 14, 2024
