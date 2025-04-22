'use client';

import type { PackageConfig } from '../types.js';

export const zustandPackage: PackageConfig = {
    name: 'zustand',
    displayName: 'Zustand',
    description: 'Small, fast and scalable state-management solution',
    version: '^4.4.7',
    frameworks: ['react-vite', 'tanstack-start'],
    configFiles: [
        {
            path: 'src/store/index.ts',
            content: `import { create } from 'zustand';

// Define your store types
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Create a store
export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// You can create multiple stores for different features
`,
        },
    ],
    readmeSection: `
## State Management with Zustand

This project uses [Zustand](https://zustand-demo.pmnd.rs/) for state management.

Example usage:

\`\`\`typescript
import { useCounterStore } from 'src/store';

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
\`\`\`
`,
};
