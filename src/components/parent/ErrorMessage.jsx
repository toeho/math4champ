/**
 * ErrorMessage Component
 * Displays an inline error message with icon and optional retry action
 */
export default function ErrorMessage({ 
  message, 
  onRetry = null, 
  onDismiss = null,
  className = '' 
}) {
  return (
    <div 
      className={`flex items-start gap-3 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <svg 
        className="w-5 h-5 flex-shrink-0 mt-0.5" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-semibold underline hover:no-underline transition-all"
            aria-label="Retry action"
          >
            Try Again
          </button>
        )}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:bg-red-500/20 rounded p-1 transition-colors"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
