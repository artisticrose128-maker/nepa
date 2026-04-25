import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from '../App';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should render the application without basic accessibility violations', async () => {
    const { container } = render(<App />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should include a skip link and accessible navigation landmarks', () => {
    const { getByRole, getByLabelText } = render(<App />);

    expect(getByLabelText(/skip to main content/i)).toBeInTheDocument();
    expect(getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });
});
