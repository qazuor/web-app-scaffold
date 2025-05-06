import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Counter from '../components/Counter';

describe('Counter Component', () => {
    it('renders counter button with initial count', () => {
        render(<Counter />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Count: 0');
    });

    it('increments counter when clicked', () => {
        render(<Counter />);
        const button = screen.getByRole('button');

        fireEvent.click(button);
        expect(button).toHaveTextContent('Count: 1');

        fireEvent.click(button);
        expect(button).toHaveTextContent('Count: 2');
    });

    it('displays explanation text', () => {
        render(<Counter />);
        expect(screen.getByText(/This is a React component/)).toBeInTheDocument();
    });
});
