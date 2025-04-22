import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import './global.css';

// Declare appName here or import it if it's defined elsewhere
const appName = 'TanStack App'; // Replace with your app name or import

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen flex flex-col">
            <header className="bg-primary text-primary-foreground shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">{appName}</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <a
                                    href="/"
                                    className="hover:underline"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/about"
                                    className="hover:underline"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/api/hello"
                                    className="hover:underline"
                                >
                                    API
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

            <footer className="bg-secondary py-6">
                <div className="container mx-auto px-4 text-center text-secondary-foreground">
                    <p>
                        © {new Date().getFullYear()} {appName}. All rights reserved.
                    </p>
                </div>
            </footer>

            {process.env.NODE_ENV === 'development' && (
                <TanStackRouterDevtools position="bottom-right" />
            )}
        </div>
    ),
});
