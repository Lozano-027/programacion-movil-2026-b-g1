import { render, screen, waitFor } from '@testing-library/react';
import TasksView from './TasksView.jsx';

const user = { email: 'ana@test.local' };

afterEach(() => vi.restoreAllMocks());

describe('TasksView', () => {
  it('sends the Bearer token and lists the tasks returned by the API', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        content: [
          { id: '1', title: 'Write the README', status: 'PENDING', dueDate: '2026-11-10', overdue: false },
        ],
        page: 0, size: 50, totalElements: 1, totalPages: 1,
      }),
    });

    render(<TasksView token="jwt-token" user={user} onLogout={vi.fn()} onUnauthorized={vi.fn()} />);

    expect(await screen.findByText('Write the README')).toBeInTheDocument();
    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('calls onUnauthorized when the token is rejected with 401', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ code: 'UNAUTHORIZED', message: 'Authentication is required.', details: [] }),
    });
    const onUnauthorized = vi.fn();

    render(<TasksView token="expired" user={user} onLogout={vi.fn()} onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
  });
});
