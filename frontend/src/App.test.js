import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page', () => {
  render(<App />);
  expect(screen.getByText(/elevate your/i)).toBeInTheDocument();
});