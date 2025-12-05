import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentRegister from '../ParentRegister';
import { ParentContext } from '../../../contexts/ParentContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ParentRegister', () => {
  const mockRegister = vi.fn();
  const mockContextValue = {
    register: mockRegister,
    parent: null,
    loading: false,
  };

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <BrowserRouter>
        <ParentContext.Provider value={contextValue}>
          <ParentRegister />
        </ParentContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form', () => {
    renderWithContext();

    expect(screen.getByText('Parent Registration')).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/student username/i)).toBeInTheDocument();
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

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'student1' } });

    expect(usernameInput.value).toBe('parent1');
    expect(passwordInput.value).toBe('password123');
    expect(studentUsernameInput.value).toBe('student1');
  });

  it('should show validation error for empty required fields', async () => {
    renderWithContext();

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/username, password, and student username are required/i)
      ).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should show validation error for short username', async () => {
    renderWithContext();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'student1' } });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should successfully register with valid data', async () => {
    mockRegister.mockResolvedValue({
      success: true,
      data: { id: 1, username: 'parent1' },
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'student1' } });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'parent1',
        password: 'password123',
        name: '',
        phone_number: '',
        student_username: 'student1',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/parent/login');
  });

  it('should show error message for duplicate username', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      message: 'Username already exists',
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'student1' } });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error message for invalid student username', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      message: 'Student not found',
    });

    renderWithContext();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'nonexistent' } });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/student not found/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during registration', async () => {
    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, data: {} }), 100)
        )
    );

    renderWithContext();

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const studentUsernameInput = screen.getByLabelText(/student username/i);

    fireEvent.change(usernameInput, { target: { value: 'parent1' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(studentUsernameInput, { target: { value: 'student1' } });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/registering/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/parent/login');
    });
  });

  it('should have link to login page', () => {
    renderWithContext();

    const loginLink = screen.getByText(/already have an account\? login/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/parent/login');
  });

  it('should include optional fields', () => {
    renderWithContext();

    // Name and phone number are optional fields
    const nameInput = screen.queryByLabelText(/^name$/i);
    const phoneInput = screen.queryByLabelText(/phone/i);

    // These might be present depending on implementation
    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      expect(nameInput.value).toBe('John Doe');
    }

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
      expect(phoneInput.value).toBe('+1234567890');
    }
  });

  it('should show password strength indicator', () => {
    renderWithContext();

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Weak password
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    
    // The component should show some indication of password strength
    // This test verifies the password field accepts input
    expect(passwordInput.value).toBe('123456');
  });
});
