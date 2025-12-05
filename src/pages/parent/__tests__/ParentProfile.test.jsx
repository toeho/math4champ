// src/pages/parent/__tests__/ParentProfile.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ParentProfile from "../ParentProfile";
import { ParentContext } from "../../../contexts/ParentContext";

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ParentProfile", () => {
  const mockParent = {
    authenticated: true,
    username: "parent123",
  };

  const mockStats = {
    child: {
      username: "student123",
      name: "John Doe",
      class_level: "Class 5",
      level: 3,
      total_attempts: 50,
      correct_attempts: 40,
      accuracy: 80,
      score: 400,
      current_streak: 5,
      max_streak: 10,
    },
    comparison: {
      class_count: 30,
      avg_score: 350,
      avg_accuracy: 70,
      top_score: 500,
      rank: 5,
      percentile: 83,
    },
  };

  const mockLogout = vi.fn();

  const renderWithContext = (contextValue) => {
    return render(
      <BrowserRouter>
        <ParentContext.Provider value={contextValue}>
          <ParentProfile />
        </ParentContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    renderWithContext({
      parent: null,
      stats: null,
      loading: true,
      logout: mockLogout,
    });

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it("should redirect to login if not authenticated", () => {
    renderWithContext({
      parent: null,
      stats: null,
      loading: false,
      logout: mockLogout,
    });

    expect(mockNavigate).toHaveBeenCalledWith("/parent/login");
  });

  it("should display parent profile information", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    expect(screen.getByText("Parent Profile")).toBeInTheDocument();
    expect(screen.getByText("parent123")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("student123")).toBeInTheDocument();
  });

  it("should show read-only fields when not editing", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Linked Student")).toBeInTheDocument();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should enter edit mode when Edit Profile is clicked", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    const editButton = screen.getByText("Edit Profile");
    fireEvent.click(editButton);

    expect(screen.getByText("Save Changes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toBeInTheDocument();
  });

  it("should validate name field on save", async () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit Profile"));

    // Clear name field
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "A" } });

    // Try to save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("should validate phone number format on save", async () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit Profile"));

    // Enter invalid phone number
    const phoneInput = screen.getByLabelText("Phone number");
    fireEvent.change(phoneInput, { target: { value: "invalid-phone" } });

    // Try to save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it("should show success message after saving", async () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit Profile"));

    // Update name
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

    // Save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(
      () => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should cancel editing and reset form", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit Profile"));

    // Change name
    const nameInput = screen.getByLabelText("Name");
    fireEvent.change(nameInput, { target: { value: "Changed Name" } });

    // Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Should exit edit mode
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(screen.queryByText("Save Changes")).not.toBeInTheDocument();
  });

  it("should call logout and navigate when Logout is clicked", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/parent/login");
  });

  it("should disable username and student_username fields in edit mode", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit Profile"));

    const usernameInput = screen.getByLabelText("Username (read-only)");
    const studentInput = screen.getByLabelText("Linked student username (read-only)");

    expect(usernameInput).toBeDisabled();
    expect(studentInput).toBeDisabled();
  });

  it("should show 'Not set' for empty phone number", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    // Check that "Not set" appears for phone number
    const notSetElements = screen.getAllByText("Not set");
    expect(notSetElements.length).toBeGreaterThan(0);
  });

  it("should have accessible buttons with proper ARIA labels", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    expect(screen.getByLabelText("Edit profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Logout")).toBeInTheDocument();
  });

  it("should have minimum touch target sizes for buttons", () => {
    renderWithContext({
      parent: mockParent,
      stats: mockStats,
      loading: false,
      logout: mockLogout,
    });

    const editButton = screen.getByLabelText("Edit profile");
    const logoutButton = screen.getByLabelText("Logout");

    // Check that buttons have min-h-[48px] class (48px minimum height)
    expect(editButton.className).toContain("min-h-[48px]");
    expect(logoutButton.className).toContain("min-h-[48px]");
  });
});
