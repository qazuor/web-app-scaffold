import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

// Define appName here
const appName = 'TanStack Start';

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen flex flex-col">
            <header className="bg-primary text-primary-foreground shadow-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">{appName}</h1>
                    <nav>
                        <ul className="flex space-x-4">
                            <li>
                                <Link
                                    to="/"
                                    className="hover:underline"
                                    activeProps={{
                                        className: 'font-bold underline',
                                    }}
                                >
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="hover:underline"
                                    activeProps={{
                                        className: 'font-bold underline',
                                    }}
                                >
                                    Acerca de
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="hover:underline"
                                    activeProps={{
                                        className: 'font-bold underline',
                                    }}
                                >
                                    Contacto
                                </Link>
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
                        © {new Date().getFullYear()} {appName}. Todos los derechos reservados.
                    </p>
                </div>
            </footer>

            {process.env.NODE_ENV === 'development' && (
                <TanStackRouterDevtools position="bottom-right" />
            )}
        </div>
    ),
});
