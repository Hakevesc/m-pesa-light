import { z } from 'zod';
import type { DesignTheme, DesignTokens } from './types';

export const themeSchema = z.object({
  id: z.enum(['light', 'dark']),
  label: z.string(),
  colors: z.record(z.string())
});

export const tokensSchema = z.object({
  version: z.string(),
  spacing: z.record(z.string()),
  radius: z.record(z.string()),
  shadow: z.record(z.string()),
  blur: z.record(z.string()),
  stroke: z.record(z.string()),
  typography: z.record(
    z.object({
      fontSize: z.string(),
      lineHeight: z.string(),
      fontWeight: z.number(),
      letterSpacing: z.string().optional(),
      textTransform: z.string().optional()
    })
  ),
  icons: z.record(z.union([z.string(), z.number()])),
  fonts: z.array(z.string())
});

export function validateTheme(theme: unknown) {
  return themeSchema.parse(theme) as DesignTheme;
}

export function validateTokens(tokens: unknown) {
  return tokensSchema.parse(tokens) as DesignTokens;
}
