import type { JSX } from 'react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';

export function Code({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}): JSX.Element {
    return <code className={className}>{children}</code>;
}
