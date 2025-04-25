## Better Auth Integration

This project uses [Better Auth](https://www.better-auth.com) for authentication. Better Auth provides a secure, feature-rich authentication solution with built-in security features.

### Setup

1. Create a Better Auth account and get your credentials
2. Add your credentials to `.env` based on your selected authentication providers:

   For Email & Password:
   ```env
   BETTER_AUTH_CLIENT_ID=your_client_id
   BETTER_AUTH_CLIENT_SECRET=your_client_secret
   BETTER_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

   For Google Sign-in:
   ```env
   BETTER_AUTH_GOOGLE_CLIENT_ID=your_google_client_id
   BETTER_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   For Facebook Sign-in:
   ```env
   BETTER_AUTH_FACEBOOK_APP_ID=your_facebook_app_id
   BETTER_AUTH_FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

### Usage

```typescript
// Wrap your app with AuthProvider
import { AuthProvider } from '@repo/auth';

function App() {
    return (
        <AuthProvider>
            <YourApp />
        </AuthProvider>
    );
}

// Use authentication in components
import { useAuth } from '@repo/auth';

function Profile() {
    const { user, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <button onClick={() => login()}>Log in</button>;
    }

    return (
        <div>
            <h1>Welcome {user.name}</h1>
            <button onClick={() => logout()}>Log out</button>
        </div>
    );
}
```

### Features

- 🔒 Secure authentication
- 📧 Email & Password authentication
- 🔑 Social sign-in (Google, Facebook)
- 👤 User management
- 🔄 Password reset
- 🔐 Role-based access control
- 🌐 Multi-tenant support
