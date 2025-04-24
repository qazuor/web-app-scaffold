## date-fns

This project uses [date-fns](https://date-fns.org/) for date manipulation and formatting.

Example usage:

```typescript
import { format, addDays, differenceInDays } from "date-fns";

// Format a date
const formattedDate = format(new Date(), "yyyy-MM-dd");

// Add days to a date
const futureDate = addDays(new Date(), 7);

// Calculate difference between dates
const daysDifference = differenceInDays(futureDate, new Date());
```
