/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional message
 */
export default function LoadingSpinner({ message = 'Loading...', size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-white/30 border-t-white rounded-full animate-spin`}
        role="status"
        aria-label={message}
      />
      {message && (
        <p className="text-white/80 text-sm font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-600 to-indigo-700 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
