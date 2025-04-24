'use client';

import { useState } from 'react';
import './App.css';

function App() {
    const [count, setCount] = useState(0);
    const appName = 'My React App'; // Declared appName variable

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <header className="py-6 text-center">
                <h1 className="text-4xl font-bold text-gray-800">{appName}</h1>
                <p className="mt-2 text-gray-600">Creado con React + Vite</p>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setCount((count) => count + 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Contador: {count}
                        </button>

                        <p className="mt-4 text-gray-700">
                            Edita{' '}
                            <code className="font-mono bg-gray-100 p-1 rounded">src/App.tsx</code> y
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
}

export default App;
