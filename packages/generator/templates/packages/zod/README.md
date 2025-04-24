## Zod

This project uses [Zod](https://zod.dev/) for schema validation and type inference.

Example usage:

```typescript
import { z } from "zod";

// Define a schema
const UserSchema = z.object({
  id: z.string().uuid(),
  "name": z.string().min(2),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Infer the TypeScript type
type User = z.infer<typeof UserSchema>;

// Validate data
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}
```
