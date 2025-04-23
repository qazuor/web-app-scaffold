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
        scripts: {
            sqlite: {
                generate: 'drizzle-kit generate:sqlite',
                push: 'drizzle-kit push:sqlite',
            },
            postgres: {
                generate: 'drizzle-kit generate:pg',
                push: 'drizzle-kit push:pg',
            },
            mysql: {
                generate: 'drizzle-kit generate:mysql',
                push: 'drizzle-kit push:mysql',
            },
            singlestore: {
                generate: 'drizzle-kit generate:mysql',
                push: 'drizzle-kit push:mysql',
            },
        },
    },
    devDependencies: ['drizzle-kit@^0.20.10'],
    configFiles: [
        {
            path: 'src/db/schema.ts',
            content: (appName, port, selectedConfig) => {
                const imports = {
                    sqlite: "import { integer, sqliteTable as table, text } from 'drizzle-orm/sqlite-core';",
                    postgres:
                        "import { integer, pgTable as table, text } from 'drizzle-orm/pg-core';",
                    mysql: "import { int, mysqlTable as table, varchar } from 'drizzle-orm/mysql-core';",
                    singlestore:
                        "import { int, mysqlTable as table, varchar } from 'drizzle-orm/mysql-core';",
                };

                const config = selectedConfig || 'sqlite';
                const isMySQL = config === 'mysql' || config === 'singlestore';

                return `${imports[config]}

export const users = table('users', {
    id: ${isMySQL ? 'varchar("id", { length: 36 })' : 'text("id")'}.primaryKey(),
    name: ${isMySQL ? 'varchar("name", { length: 255 })' : 'text("name")'}.notNull(),
    email: ${isMySQL ? 'varchar("email", { length: 255 })' : 'text("email")'}.notNull().unique(),
    createdAt: ${isMySQL ? 'int("created_at")' : 'integer("created_at", { mode: "timestamp" })'}.notNull().defaultNow(),
});

export const posts = table('posts', {
    id: ${isMySQL ? 'varchar("id", { length: 36 })' : 'text("id")'}.primaryKey(),
    title: ${isMySQL ? 'varchar("title", { length: 255 })' : 'text("title")'}.notNull(),
    content: ${isMySQL ? 'varchar("content", { length: 65535 })' : 'text("content")'}.notNull(),
    authorId: ${isMySQL ? 'varchar("author_id", { length: 36 })' : 'text("author_id")'}.notNull().references(() => users.id),
    createdAt: ${isMySQL ? 'int("created_at")' : 'integer("created_at", { mode: "timestamp" })'}.notNull().defaultNow(),
});`;
            },
        },
        {
            path: 'src/db/index.ts',
            content: (appName, port, selectedConfig) => {
                const imports = {
                    sqlite: `import { drizzle } from 'drizzle-orm/better-sqlite3';\nimport Database from 'better-sqlite3';`,
                    postgres: `import { drizzle } from 'drizzle-orm/postgres-js';\nimport postgres from 'postgres';`,
                    mysql: `import { drizzle } from 'drizzle-orm/mysql2';\nimport mysql from 'mysql2/promise';`,
                    singlestore: `import { drizzle } from 'drizzle-orm/mysql2';\nimport { createClient } from '@singlestore/http-client';`,
                };

                const config = selectedConfig || 'sqlite';
                const dbInit = {
                    sqlite: `const sqlite = new Database('sqlite.db');\nexport const db = drizzle(sqlite, { schema });`,
                    postgres: `const client = postgres(process.env.DATABASE_URL!);\nexport const db = drizzle(client, { schema });`,
                    mysql: `const client = await mysql.createConnection(process.env.DATABASE_URL!);\nexport const db = drizzle(client, { schema });`,
                    singlestore: `const client = createClient(process.env.DATABASE_URL!);\nexport const db = drizzle(client, { schema });`,
                };

                return `${imports[config]}
import * as schema from './schema';

// Initialize database client
${dbInit[config]}

// Export types
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Post = typeof schema.posts.$inferSelect;
export type NewPost = typeof schema.posts.$inferInsert;

// Export schema
export * from './schema';`;
            },
        },
        {
            path: 'drizzle.config.ts',
            content: (appName, port, selectedConfig) => {
                const config = selectedConfig || 'sqlite';
                const driverConfig = {
                    sqlite: {
                        driver: 'better-sqlite3',
                        dbCredentials: "{ url: 'sqlite.db' }",
                    },
                    postgres: {
                        driver: 'pg',
                        dbCredentials: '{ connectionString: process.env.DATABASE_URL }',
                    },
                    mysql: {
                        driver: 'mysql2',
                        dbCredentials: '{ url: process.env.DATABASE_URL }',
                    },
                    singlestore: {
                        driver: 'mysql2',
                        dbCredentials: '{ url: process.env.DATABASE_URL }',
                    },
                };

                return `import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: '${driverConfig[config].driver}',
    dbCredentials: ${driverConfig[config].dbCredentials}
} satisfies Config;`;
            },
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
