import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/constants/messages';

/**
 * Mirrors `backend/src/auth/dto/login.dto.ts`. Min length matches the
 * server-side rule (>= 8) so the user gets the same feedback either way.
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: VALIDATION_MESSAGES.emailRequired,
      invalid_type_error: VALIDATION_MESSAGES.emailRequired,
    })
    .trim()
    .min(1, VALIDATION_MESSAGES.emailRequired)
    .email(VALIDATION_MESSAGES.emailInvalid),
  password: z
    .string({
      required_error: VALIDATION_MESSAGES.passwordRequired,
      invalid_type_error: VALIDATION_MESSAGES.passwordRequired,
    })
    .min(8, VALIDATION_MESSAGES.passwordTooShort),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
