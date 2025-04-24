import type { JSX } from 'react';
import React = require('react');

export function Code({
    children,
    className
}: {
    children: React.ReactNode;
    className?: string;
}): JSX.Element {
    return <code className={className}>{children}</code>;
}
