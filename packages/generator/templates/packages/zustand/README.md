## State Management with Zustand

This project uses [Zustand](https://zustand-demo.pmnd.rs/) for state management.

Example usage:

```typescript
import { useCounterStore } from "src/store";

function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```
