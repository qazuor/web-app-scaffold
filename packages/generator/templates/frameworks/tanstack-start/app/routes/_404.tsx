import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_404')({
    component: NotFoundPage,
});

function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <h1 className="mb-4 font-bold text-4xl">404 - Page Not Found</h1>
            <p className="mb-8 text-xl">The page you are looking for does not exist.</p>
            <a
                href="/"
                className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
                Go Home
            </a>
        </div>
    );
}
