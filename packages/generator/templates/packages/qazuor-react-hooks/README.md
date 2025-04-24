## Qazuor React Hooks

This project uses [@qazuor/react-hooks](https://github.com/qazuor/react-hooks) for common React hook patterns.

Example usage:

```typescript
import { useLocalStorage, useMediaQuery, useDebounce } from "@qazuor/react-hooks";

function MyComponent() {
  // Use local storage with automatic serialization/deserialization
  const [user, setUser] = useLocalStorage("user", { "name": "Guest" });

  // Responsive design hook
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Debounce a value
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```
