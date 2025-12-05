import LoadingSpinner from './LoadingSpinner';

/**
 * LoadingOverlay Component
 * Displays a semi-transparent overlay with loading spinner
 */
export default function LoadingOverlay({ message = 'Loading...', show = true }) {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <LoadingSpinner message={message} size="lg" />
      </div>
    </div>
  );
}
