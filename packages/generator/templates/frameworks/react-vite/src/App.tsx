import { type FC, useState } from 'react';
import './App.css';

/**
 * Main application component
 */
const App: FC = () => {
    const [count, setCount] = useState(0);
    const appName = import.meta.env.VITE_APP_TITLE || 'My React App';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <header className="py-6 text-center">
                <h1 className="font-bold text-4xl text-gray-800">{appName}</h1>
                <p className="mt-2 text-gray-600">Built with React + Vite</p>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setCount((count) => count + 1)}
                            className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        >
                            Contador: {count}
                        </button>

                        <p className="mt-4 text-gray-700">
                            Edita{' '}
                            <code className="rounded bg-gray-100 p-1 font-mono">src/App.tsx</code> y
                            guarda para probar HMR
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-gray-500">
                <p>
                    © {new Date().getFullYear()} {appName}
                </p>
            </footer>
        </div>
    );
};

export default App;
