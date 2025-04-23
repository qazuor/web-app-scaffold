import type { PackageConfig } from '../types.js';

export const drizzlePackage: PackageConfig = {
    name: 'drizzle-orm',
    displayName: 'Drizzle ORM',
    description: 'TypeScript ORM with a focus on type safety',
    version: '^0.29.3',
    canBeShared: true,
    sharedPackageTemplate: 'drizzle',
    defaultSharedName: 'db',
    configOptions: {
        type: 'list',
        message: 'Which database provider would you like to use?',
        choices: [
            { name: 'SQLite - Lightweight local database', value: 'sqlite' },
            { name: 'PostgreSQL - Full-featured SQL database', value: 'postgres' },
            { name: 'MySQL - Popular open-source database', value: 'mysql' },
            { name: 'SingleStore - Distributed SQL database', value: 'singlestore' },
        ],
        dependencies: {
            sqlite: {
                dependencies: ['better-sqlite3@^9.2.2'],
                devDependencies: ['@types/better-sqlite3@^7.6.8'],
            },
            postgres: {
                dependencies: ['postgres@^3.4.3'],
                devDependencies: [],
            },
            mysql: {
                dependencies: ['mysql2@^3.6.5'],
                devDependencies: [],
            },
            singlestore: {
                dependencies: ['@singlestore/http-client@^1.0.0'],
                devDependencies: [],
            },
        },
    },
    devDependencies: ['drizzle-kit@^0.20.10'],
    configFiles: [
        {
            path: 'src/db/schema.ts',
            content: `import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
`,
        },
        {
            path: 'src/db/index.ts',
            content: `import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Export types
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Post = typeof schema.posts.$inferSelect;
export type NewPost = typeof schema.posts.$inferInsert;
`,
        },
        {
            path: 'drizzle.config.ts',
            content: `import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: 'sqlite.db',
  },
} satisfies Config;
`,
        },
    ],
    envVars: {
        DATABASE_URL: 'sqlite.db',
    },
    readmeSection: `
## Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) for database access.

Database schema is defined in \`src/db/schema.ts\`.

Example usage:

\`\`\`typescript
import { db, type NewUser } from 'src/db';
import { users } from 'src/db/schema';
import { v4 as uuid } from 'uuid';

// Insert a new user
const newUser: NewUser = {
  id: uuid(),
  name: 'John Doe',
  email: 'john@example.com',
};

await db.insert(users).values(newUser);

// Query users
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.email, 'john@example.com')).get();
\`\`\`

To run migrations:

\`\`\`bash
pnpm drizzle-kit generate
\`\`\`
`,
};
