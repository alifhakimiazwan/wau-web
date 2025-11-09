import { z } from "zod";
import { isEmbeddableUrl } from "@/lib/utils/url-helpers";

export const productBasicInfoSchema = z.object({
  name: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
});

export const successMessageSchema = z.object({
  successMessage: z.string().optional(),
  
});

export const customerFieldsSchema = z.object({
  email: z.boolean(),
  name: z.boolean(),
  phone: z.boolean(),
});

export const freebieConfigSchema = z.discriminatedUnion("freebieType", [
  z.object({
    freebieType: z.literal("link"),
    freebieLink: z.object({
      url: z.string().url("Please enter a valid URL"),
      title: z.string().min(1, "Link title is required"),
    }),
  }),
  z.object({
    freebieType: z.literal("file"),
    freebieFile: z.object({
      url: z.string(),
      filename: z.string(),
      size: z.number(),
    }),
  }),
]);

export const leadMagnetSchema = z
  .object({
    name: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    buttonText: z.string().optional(),
    thumbnail: z.string().optional(),
    customerFields: customerFieldsSchema,
    freebieType: z.enum(["link", "file"]),
    // Make nested fields optional to avoid validation when object exists but is empty
    freebieLink: z
      .object({
        url: z.string().optional(),
        title: z.string().optional(),
      })
      .optional()
      .nullable(),
    freebieFile: z
      .object({
        url: z.string().optional(),
        filename: z.string().optional(),
        size: z.number().optional(),
      })
      .optional()
      .nullable(),
    successMessage: z.string().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .superRefine((data, ctx) => {
    // Only validate link fields when freebieType is "link"
    if (data.freebieType === "link") {
      if (!data.freebieLink?.url || data.freebieLink.url.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Link URL is required when freebie type is link",
          path: ["freebieLink", "url"],
        });
      }
      if (!data.freebieLink?.title || data.freebieLink.title.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Link title is required when freebie type is link",
          path: ["freebieLink", "title"],
        });
      }
      // Validate URL format only when provided
      if (data.freebieLink?.url) {
        try {
          new URL(data.freebieLink.url);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a valid URL",
            path: ["freebieLink", "url"],
          });
        }
      }
    }

    // Only validate file fields when freebieType is "file"
    if (data.freebieType === "file") {
      if (!data.freebieFile?.url || data.freebieFile.url.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File is required when freebie type is file",
          path: ["freebieFile"],
        });
      }
    }
  })
  .transform((data) => {
    // Clean up: remove opposite type's data to avoid confusion
    if (data.freebieType === "link") {
      return {
        ...data,
        freebieFile: undefined,
        freebieLink: data.freebieLink && data.freebieLink.url ? {
          url: data.freebieLink.url,
          title: data.freebieLink.title || "",
        } : undefined,
      };
    } else {
      return {
        ...data,
        freebieLink: undefined,
        freebieFile: data.freebieFile && data.freebieFile.url ? {
          url: data.freebieFile.url,
          filename: data.freebieFile.filename || "",
          size: data.freebieFile.size || 0,
        } : undefined,
      };
    }
  });

export type LeadMagnetSchema = z.infer<typeof leadMagnetSchema>;
export type LeadMagnetInput = z.input<typeof leadMagnetSchema>;

// Link Schema with conditional validation based on style
export const linkSchema = z
  .object({
    name: z.string().optional(),
    subtitle: z.string().optional(),
    buttonText: z.string().optional(),
    thumbnail: z.string().optional(),
    style: z.enum(["classic", "callout", "embed"]),
    url: z.string().url("Please enter a valid URL"),
    status: z.enum(["draft", "published"]).default("draft"),
  })
  .refine(
    (data) => {
      // Classic needs title
      if (data.style === "classic" && !data.name) {
        return false;
      }
      return true;
    },
    {
      message: "Title is required for classic style",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      // Callout needs title, subtitle, and buttonText
      if (data.style === "callout") {
        if (!data.name) return false;
        if (!data.subtitle) return false;
        if (!data.buttonText) return false;
      }
      return true;
    },
    {
      message:
        "Title, subtitle, and button text are required for callout style",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      // Embed style only accepts YouTube and Spotify URLs
      if (data.style === "embed") {
        return isEmbeddableUrl(data.url);
      }
      return true;
    },
    {
      message:
        "Embed links only support YouTube and Spotify URLs. Please use Classic or Callout style for other links.",
      path: ["url"],
    }
  );

export type LinkSchema = z.infer<typeof linkSchema>;
export type LinkInput = z.input<typeof linkSchema>;


export const digitalProductSchema = z.object({
  style: z.enum(["classic", "callout"]),
  cardThumbnail: z.string().optional(),
  cardTitle: z.string().min(1, "Card title is required"),
  cardSubtitle: z.string().optional(),
  cardButtonText: z.string().optional(),

  checkoutImage: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  bottomTitle: z.string().min(1, "Bottom Title is required"),
  checkoutButtonText: z.string().min(1, "Button Text is required"),

  price: z.number().min(0.01, "Price must be greater than 0"),
  discountedPrice: z.number().optional(),
  hasDiscount: z.boolean().default(false),

  customerFields: customerFieldsSchema,

  productType: z.enum(["link", "file"]),
  productLink: z.object({url: z.string().url("Please enter a valid URL"), title: z.string().min(1, "URL Title is required")}).optional(),
  productFile: z.object({url: z.string(), filename: z.string(), size: z.number()}).optional(),

  status: z.enum(["draft", "published"]).default("draft"),
 
})
.refine((data) => {
    if (data.style === "callout"){
      if(!data.cardSubtitle) return false;
      if(!data.cardButtonText) return false
    }
    return true;
},
{message: "Subtitle and button text are required for callout style", path: ["cardSubtitle"]})
.refine((data) =>{ if (data.productType === "link"){
  return !!data.productLink?.url && !!data.productLink?.title;
}
return true}, {message: "Link URL and title are required when product type is link" , path: ["productType"]})
.refine((data) => {
  if (data.productType === "file"){
    return !!data.productFile?.url;
  }
  return true
}, {
  message: "File is required when product type is file", path: ["productType"],
})
.refine((data) => {
  if (data.hasDiscount && data.discountedPrice){
    return data.discountedPrice < data.price
  }
  return true
}, {
  message: "Discounted price must be less than regular price", path: ["discountedPrice"]
});

export type DigitalProductSchema = z.infer<typeof digitalProductSchema>
export type DigitalProductInput = z.input<typeof digitalProductSchema>

export const productReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  customerName: z.string().min(1, "Reviewer name is required"),
  reviewText: z.string().min(1, "Review text is required"),
  profileImage: z.string().optional(),
});
export type ProductReviewSchema = z.infer<typeof productReviewSchema>;