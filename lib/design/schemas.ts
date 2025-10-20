import { z } from 'zod';

export const DesignSchema = z.object({
  storeId: z.string().uuid(),
  design: z.object({
    themeId: z.string(),
    fontFamily: z.string(),
    colors: z.object({
      primary: z.string(),
      accent: z.string(),
    }),
    blockShape: z.enum(['square', 'rounded', 'pill']),
    buttonConfig: z.object({
      style: z.enum(['filled', 'outlined', 'ghost']),
    }),
  }),
});