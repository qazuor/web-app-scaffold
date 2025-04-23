import { z } from 'zod';
import { dateSchema, idSchema, slugSchema } from './common';

export const postSchema = z.object({
    id: idSchema,
    title: z.string().min(1),
    slug: slugSchema,
    content: z.string(),
    authorId: idSchema,
    createdAt: dateSchema,
});

export const createPostSchema = postSchema.omit({ id: true, createdAt: true });
export const updatePostSchema = createPostSchema.partial();

export type Post = z.infer<typeof postSchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
