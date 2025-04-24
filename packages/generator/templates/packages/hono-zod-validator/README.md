## Hono Zod Validator

This project uses [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) for request validation.

Example usage:

```typescript
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const userSchema = z.object({
  "name": z.string().min(2),
  email: z.string().email(),
});

app.post("/users", zValidator("json", userSchema), (c) => {
  const data = c.req.valid("json");
  // data is typed as { "name": string, email: string }
  return c.json({ message: "User created", user: data });
});

export default app;
```
