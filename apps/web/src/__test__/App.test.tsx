import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import App from '../App';

describe('App Component', () => {
    it('renders app title and description', () => {
        render(<App />);

        // Check for app title (using env var or default)
        const appName = import.meta.env.VITE_APP_TITLE || 'My React App';
        expect(screen.getByText(appName)).toBeInTheDocument();
        expect(screen.getByText('Built with React + Vite')).toBeInTheDocument();
    });

    it('increments counter when button is clicked', () => {
        render(<App />);

        // Get the counter button
        const counterButton = screen.getByRole('button');
        expect(counterButton).toHaveTextContent('Contador: 0');

        // Click the button and verify counter increases
        fireEvent.click(counterButton);
        expect(counterButton).toHaveTextContent('Contador: 1');
    });

    it('displays HMR instruction text', () => {
        render(<App />);

        // Check for the HMR instruction text
        expect(screen.getByText(/Edita/)).toBeInTheDocument();
        expect(screen.getByText('src/App.tsx')).toBeInTheDocument();
        expect(screen.getByText(/guarda para probar HMR/)).toBeInTheDocument();
    });

    it('displays current year in footer', () => {
        render(<App />);

        const currentYear = new Date().getFullYear().toString();
        const appName = import.meta.env.VITE_APP_TITLE || 'My React App';

        // Check for footer with current year
        expect(screen.getByText(`© ${currentYear} ${appName}`)).toBeInTheDocument();
    });
});
