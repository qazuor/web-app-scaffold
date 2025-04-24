'use client';

import type { ReactNode } from 'react';
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';

interface ButtonProps {
    children: ReactNode;
    className?: string;
    appName: string;
}

export const Button = ({ children, className, appName }: ButtonProps) => {
    return (
        <button
            type="button"
            className={className}
            onClick={() => alert(`Hello from your ${appName} app!`)}
        >
            {children}
        </button>
    );
};
