import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentLogin from '../ParentLogin';
import { ParentContext } from '../../../contexts/ParentContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ParentLogin', () => {
  const mockLogin = vi.fn();
  const mockContextValue = {
    login: mockLogin,
    parent: null,
    loading: false,
    stats: null,
    statsLoading: false,
  };

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <ParentContext.Provider value={contextValue}>
          <ParentLogin />
        </ParentContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithContext();

    expect(screen.getByText('Parent Portal')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should redirect to dashboard if already logged in', () => {
    const loggedInContext = {
      ...mockContextValue,
      parent: { authenticated: true, username: 'parent1' },
    };

    renderWithContext(loggedInContext);

    expect(mockNavigate).toHaveBeenCalledWith('/parent/dashboard');
  });

  it('should update form fields on input', () => {
    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('parent1');
    expect(passwordInput.value).toBe('password123');
  });

  it('should show validation error for empty fields', async () => {
    renderWithContext();

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username and password are required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show validation error for short username', async () => {
    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', async () => {
    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should successfully login with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('parent1', 'password123');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/parent/dashboard');
  });

  it('should show error message for invalid credentials', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show network error message', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      message: 'Network error',
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/parent/dashboard');
    });
  });

  it('should have link to registration page', () => {
    renderWithContext();

    const registerLink = screen.getByText(/don't have an account\? register/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/parent/register');
  });

  it('should clear error when user starts typing', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    // Type more characters
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });
});
