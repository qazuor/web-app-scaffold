import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_404')({
    component: NotFoundPage,
});

function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-xl mb-8">The page you are looking for does not exist.</p>
            <a
                href="/"
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
                Go Home
            </a>
        </div>
    );
}
