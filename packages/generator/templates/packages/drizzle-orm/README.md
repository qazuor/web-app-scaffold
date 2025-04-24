## Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) for database access.

Database schema is defined in `src/db/schema.ts`.

Example usage:

```typescript
import { db, type NewUser } from "src/db";
import { users } from "src/db/schema";
import { v4 as uuid } from "uuid";

// Insert a new user
const newUser: NewUser = {
  id: uuid(),
  "name": "John Doe",
  email: "john@example.com",
};

await db.insert(users).values(newUser);

// Query users
const allUsers = await db.select().from(users);
const user = await db.select().from(users).where(eq(users.email, "john@example.com")).get();
```

To run migrations:

```bash
pnpm drizzle-kit generate
```
