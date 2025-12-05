import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render "No statistics available" when stats is null', () => {
    render(<StatsCard stats={null} />);
    expect(screen.getByText('No statistics available')).toBeInTheDocument();
  });

  it('should render "No statistics available" when stats is undefined', () => {
    render(<StatsCard stats={undefined} />);
    expect(screen.getByText('No statistics available')).toBeInTheDocument();
  });

  it('should render all stat cards with correct labels', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    render(<StatsCard stats={mockStats} />);

    expect(screen.getByText('Total Attempts')).toBeInTheDocument();
    expect(screen.getByText('Correct Attempts')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Max Streak')).toBeInTheDocument();
  });

  it('should display stat values correctly', async () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    render(<StatsCard stats={mockStats} />);

    // Wait for animations to complete
    await waitFor(
      () => {
        // Check if values are displayed (they animate, so we check for final values)
        const values = screen.getAllByText(/\d+/);
        expect(values.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('should handle zero values', () => {
    const mockStats = {
      total_attempts: 0,
      correct_attempts: 0,
      accuracy: 0,
      score: 0,
      current_streak: 0,
      max_streak: 0,
    };

    render(<StatsCard stats={mockStats} />);

    expect(screen.getByText('Total Attempts')).toBeInTheDocument();
    expect(screen.getByText('Correct Attempts')).toBeInTheDocument();
  });

  it('should handle partial stats data', () => {
    const mockStats = {
      total_attempts: 50,
      correct_attempts: 40,
      // Missing other fields - should default to 0
    };

    render(<StatsCard stats={mockStats} />);

    expect(screen.getByText('Total Attempts')).toBeInTheDocument();
    expect(screen.getByText('Correct Attempts')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('should render progress bar for accuracy', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    render(<StatsCard stats={mockStats} />);

    // Check for progress bar (role="progressbar")
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should display accuracy with percentage suffix', async () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    render(<StatsCard stats={mockStats} />);

    await waitFor(
      () => {
        // Look for text containing % symbol
        const percentageText = screen.getByText(/85%/);
        expect(percentageText).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should render with high accuracy stats', () => {
    const mockStats = {
      total_attempts: 200,
      correct_attempts: 190,
      accuracy: 95.0,
      score: 1900,
      current_streak: 15,
      max_streak: 20,
    };

    render(<StatsCard stats={mockStats} />);

    expect(screen.getByText('Total Attempts')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('should render with low accuracy stats', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 50,
      accuracy: 50.0,
      score: 500,
      current_streak: 2,
      max_streak: 5,
    };

    render(<StatsCard stats={mockStats} />);

    expect(screen.getByText('Total Attempts')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('should have proper grid layout classes', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    const { container } = render(<StatsCard stats={mockStats} />);

    // Check for grid layout
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
  });

  it('should render icons for each stat', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    const { container } = render(<StatsCard stats={mockStats} />);

    // Check for SVG icons (lucide-react renders as SVG)
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have accessible progress bar attributes', () => {
    const mockStats = {
      total_attempts: 100,
      correct_attempts: 85,
      accuracy: 85.0,
      score: 850,
      current_streak: 5,
      max_streak: 10,
    };

    render(<StatsCard stats={mockStats} />);

    const progressBars = screen.getAllByRole('progressbar');
    progressBars.forEach((bar) => {
      expect(bar).toHaveAttribute('aria-valuenow');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
