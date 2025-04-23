import { z } from 'zod';
import { dateSchema, emailSchema, idSchema } from './common';

export const userSchema = z.object({
    id: idSchema,
    email: emailSchema,
    name: z.string().min(2),
    createdAt: dateSchema,
});

export const createUserSchema = userSchema.omit({ id: true, createdAt: true });
export const updateUserSchema = createUserSchema.partial();

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
