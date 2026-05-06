import { z } from 'zod';
import { VALIDATION_MESSAGES } from '@/constants/messages';

const userStatusSchema = z.enum(['active', 'inactive']);

const trimmedRequiredString = (message: string): z.ZodString =>
  z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, message);

const requiredEmail = (): z.ZodString =>
  trimmedRequiredString(VALIDATION_MESSAGES.emailRequired).email(
    VALIDATION_MESSAGES.emailInvalid,
  );

const requiredRoleId = (): z.ZodString =>
  z
    .string({
      required_error: VALIDATION_MESSAGES.roleRequired,
      invalid_type_error: VALIDATION_MESSAGES.roleRequired,
    })
    .uuid(VALIDATION_MESSAGES.roleRequired);

/**
 * Schema for the "Add user" form. Mirrors the backend `CreateUserDto`
 * (see `backend/src/users/dto/create-user.dto.ts`). When this app grows we
 * can lift this file into a shared workspace and import it from
 * `nestjs-zod` on the backend without rewriting the rules.
 */
export const createUserSchema = z.object({
  name: trimmedRequiredString(VALIDATION_MESSAGES.nameRequired),
  email: requiredEmail(),
  status: userStatusSchema,
  roleId: requiredRoleId(),
});

/**
 * Schema for the "Edit user" form. Role is optional because Editor users
 * cannot change roles (the field is disabled and excluded from the
 * outbound DTO at submit time). Email + name are still required.
 */
export const updateUserSchema = z.object({
  name: trimmedRequiredString(VALIDATION_MESSAGES.nameRequired),
  email: requiredEmail(),
  status: userStatusSchema,
  roleId: requiredRoleId().or(z.null()).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
