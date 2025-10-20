import { z } from "zod";

// Reusable schemas for product forms
export const productBasicInfoSchema = z.object({
  name: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
});

export const successMessageSchema = z.object({
  successMessage: z.string().optional(),
});

export const customerFieldsSchema = z.object({
  email: z.boolean().default(false),
  name: z.boolean().default(false),
  phone: z.boolean().default(false),
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
    freebieLink: z
      .object({
        url: z.string().url("Please enter a valid URL"),
        title: z.string().min(1, "Link title is required"),
      })
      .optional(),
    freebieFile: z
      .object({
        url: z.string(),
        filename: z.string(),
        size: z.number(),
      })
      .optional(),
    successMessage: z.string().optional(),
    status: z.enum(["draft", "published"]).optional().default("draft"),
  })
  .refine(
    (data) => {
      if (data.freebieType === "link") {
        return !!data.freebieLink?.url && !!data.freebieLink?.title;
      }
      return true;
    },
    {
      message: "Link URL and title are required when freebie type is link",
      path: ["freebieLink"],
    }
  )
  .refine(
    (data) => {
      if (data.freebieType === "file") {
        return !!data.freebieFile?.url;
      }
      return true;
    },
    {
      message: "File is required when freebie type is file",
      path: ["freebieFile"],
    }
  );

export type LeadMagnetSchema = z.infer<typeof leadMagnetSchema>;
