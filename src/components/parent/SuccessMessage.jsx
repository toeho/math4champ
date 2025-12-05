/**
 * SuccessMessage Component
 * Displays an inline success message with icon
 */
export default function SuccessMessage({ message, onDismiss = null, className = '' }) {
  return (
    <div 
      className={`flex items-center gap-3 bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <svg 
        className="w-5 h-5 flex-shrink-0" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      <p className="flex-1 text-sm font-medium">{message}</p>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:bg-green-500/20 rounded p-1 transition-colors"
          aria-label="Dismiss message"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
