import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

describe('App', () => {
  it('shows the package list in demo mode', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Welcome, Demo User')).toBeTruthy();
    expect(screen.getByText('Laptop Sleeve')).toBeTruthy();
  });

  it('adds a new package from the free-text page', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: /add package/i }));
    await user.type(screen.getByPlaceholderText(/MacBook Pro from Amazon/i), 'Coffee beans delivery');
    await user.click(screen.getByRole('button', { name: /save package/i }));

    expect(await screen.findByText('Coffee beans delivery')).toBeTruthy();
  });
});
