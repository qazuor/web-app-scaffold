## Material UI Components

This project uses [Material UI](https://mui.com) for its component library. MUI provides a comprehensive suite of UI tools and components implementing Google"s Material Design.

Example usage:

```tsx
import { Button, Box, Typography } from "@mui/material";

function MyComponent() {
    return (
        <Box p={2}>
            <Typography variant="h4">Hello World</Typography>
            <Button variant="contained" color="primary">
                Click me
            </Button>
        </Box>
    );
}
```
