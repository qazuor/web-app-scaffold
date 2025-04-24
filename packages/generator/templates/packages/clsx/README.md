## clsx

This project uses [clsx](https://github.com/lukeed/clsx) for constructing className strings conditionally.

Example usage:

```typescript
import clsx from "clsx";

const className = clsx(
  "base-class",
  isActive && "active-class",
  { "error-class": hasError },
  ["always", "included"]
);
```
