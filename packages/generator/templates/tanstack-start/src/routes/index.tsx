import { createFileRoute } from '@tanstack/react-router';

// Define appName or import it from a config file
const appName = 'TanStack Start App';

export const Route = createFileRoute('/')({
    component: HomePage,
});

function HomePage() {
    return (
        <div className="space-y-8">
            <section className="bg-secondary rounded-lg p-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to {appName}</h1>
                <p className="text-xl text-secondary-foreground">
                    A full-stack application built with TanStack Start
                </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                    title="Enterprise-Grade Routing"
                    description="Type-safe routing with code-splitting and lazy loading."
                />
                <FeatureCard
                    title="SSR & Streaming"
                    description="Server-side rendering and streaming for optimal user experience."
                />
                <FeatureCard
                    title="Server Functions & API Routes"
                    description="Write server code alongside your client code."
                />
            </section>
        </div>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="bg-card rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-card-foreground">{description}</p>
        </div>
    );
}
