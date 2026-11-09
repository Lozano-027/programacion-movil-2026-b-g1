import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm.jsx';

function mockFetchOnce(status, body) {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

async function fillAndSubmit(email, password) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

afterEach(() => vi.restoreAllMocks());

describe('LoginForm', () => {
  it('sends the credentials to /auth/login and passes the token to onLogin', async () => {
    const auth = { token: 'jwt-token', tokenType: 'Bearer', expiresIn: 3600, user: { email: 'ana@test.local' } };
    mockFetchOnce(200, auth);
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit('ana@test.local', 'Secret123');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'ana@test.local', password: 'Secret123' }),
      }),
    );
    expect(onLogin).toHaveBeenCalledWith(auth);
  });

  it('shows an error and does not log in when the API answers 401', async () => {
    mockFetchOnce(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.', details: [] });
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit('ana@test.local', 'Wrong12345');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect');
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('explains the problem when the API cannot be reached', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    render(<LoginForm onLogin={vi.fn()} />);

    await fillAndSubmit('ana@test.local', 'Secret123');

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
  });
});
