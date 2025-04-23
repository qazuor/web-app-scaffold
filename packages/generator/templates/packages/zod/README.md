# @repo/schema

This package provides shared Zod schemas and types for use across the monorepo.

## Features

- Type-safe schema validation
- Reusable common schemas
- Shared types for entities
- Input validation utilities

## Installation

This package is automatically installed as a dependency when selecting Zod as a shared package during app generation.

To manually install in an existing app:

```bash
pnpm add @repo/schema@workspace:*
```

## Usage

```typescript
import { userSchema, type User, type CreateUser } from '@repo/schema';

// Validate user data
const userData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
};

const user = userSchema.parse(userData);

// Type inference
const createUser: CreateUser = {
    name: 'Jane Doe',
    email: 'jane@example.com'
};
```

## Available Scripts

- `pnpm lint` - Run linter
- `pnpm format` - Format code
- `pnpm typecheck` - Run TypeScript type checking

## Available Schemas

### Common Schemas
- `idSchema` - UUID validation
- `dateSchema` - Date validation with coercion
- `emailSchema` - Email format validation
- `slugSchema` - URL-friendly slug validation

### User Schemas
- `userSchema` - Complete user validation
- `createUserSchema` - New user validation
- `updateUserSchema` - User updates validation

### Post Schemas
- `postSchema` - Complete post validation
- `createPostSchema` - New post validation
- `updatePostSchema` - Post updates validation

## Adding New Schemas

1. Create a new file in `src/schemas/` for your entity
2. Export the schema and its types
3. Add the export to `src/index.ts`

Example:

```typescript
// src/schemas/comment.ts
import { z } from 'zod';
import { dateSchema, idSchema } from './common';

export const commentSchema = z.object({
    id: idSchema,
    content: z.string().min(1),
    authorId: idSchema,
    postId: idSchema,
    createdAt: dateSchema,
});

export type Comment = z.infer<typeof commentSchema>;
```

## Contributing

When making changes to this package:

1. Keep schemas consistent and reusable
2. Add proper validation messages
3. Document new schemas and types
4. Update exports in index.ts

## License

Internal package - All rights reserved
