## Framer Motion

This project uses [Framer Motion](https://www.framer.com/motion/) for animations.

Example usage:

```jsx
import { motion } from "framer-motion";

function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Hello World
    </motion.div>
  );
}
```
