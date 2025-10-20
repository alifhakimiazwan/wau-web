import { z } from 'zod'

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Username can only contain lowercase letters, numbers, and hyphens'
    )
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-'),
      'Username cannot start or end with a hyphen'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>