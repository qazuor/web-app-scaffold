import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
    component: AboutPage,
});

function AboutPage() {
    const appName = '{{appName}}';
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">About</h1>

            <p className="text-lg">
                {appName} is a full-stack application built with TanStack Start, a modern framework
                for React that includes SSR, streaming, server functions, and more.
            </p>

            <div className="bg-card rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Technologies</h2>
                <ul className="space-y-2 list-disc pl-5">
                    <li>TanStack Start - Full-stack framework</li>
                    <li>TanStack Router - Type-safe routing</li>
                    <li>TanStack Query - Server state management</li>
                    <li>React - UI library</li>
                    <li>Tailwind CSS - Utility-first CSS framework</li>
                    <li>TypeScript - Static typing</li>
                    <li>Biome - Linting and formatting</li>
                </ul>
            </div>
        </div>
    );
}
