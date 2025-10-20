import z from "zod";

export const profileSchema = z.object({
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