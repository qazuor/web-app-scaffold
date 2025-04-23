# @repo/db

This package provides a shared Drizzle ORM configuration and schema for use across the monorepo.

## Features

- Preconfigured Drizzle ORM setup with SQLite
- Type-safe database schema
- Shared database models and types
- Migration management with drizzle-kit

## Installation

This package is automatically installed as a dependency when selecting Drizzle ORM as a shared package during app generation.

To manually install in an existing app:

```bash
pnpm add @repo/db@workspace:*
```

## Usage

```typescript
import { db, type User, type NewUser } from '@repo/db';
import { users } from '@repo/db/schema';

// Insert a new user
const newUser: NewUser = {
  id: crypto.randomUUID(),
  name: 'John Doe',
  email: 'john@example.com',
};

await db.insert(users).values(newUser);

// Query users
const allUsers = await db.select().from(users);
```

## Available Scripts

- `pnpm generate` - Generate SQL migrations from schema changes
- `pnpm push` - Push schema changes to the database
- `pnpm studio` - Open Drizzle Studio to manage database data
- `pnpm lint` - Run linter
- `pnpm format` - Format code

## Schema

The database schema is defined in `src/schema.ts`. Currently includes:

### Users Table
- `id` (text, primary key)
- `name` (text, not null)
- `email` (text, not null, unique)
- `createdAt` (timestamp, not null)

### Posts Table
- `id` (text, primary key)
- `title` (text, not null)
- `content` (text, not null)
- `authorId` (text, not null, references users.id)
- `createdAt` (timestamp, not null)

## Adding New Models

To add new models to the schema:

1. Add your table definition to `src/schema.ts`
2. Export any new types from `src/index.ts`
3. Run `pnpm generate` to create migrations
4. Run `pnpm push` to apply changes to the database

## Contributing

When making changes to this package:

1. Update the schema in a backward-compatible way when possible
2. Add proper indexes for frequently queried fields
3. Document any breaking changes
4. Update tests if applicable

## License

Internal package - All rights reserved
