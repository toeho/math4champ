/**
 * EmptyState Component
 * Displays a friendly message when no data is available
 */
export default function EmptyState({ 
  icon, 
  title = 'No data available', 
  message = 'There is nothing to display at the moment.',
  action = null 
}) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-white/40"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-white/70 mb-6 max-w-md">
        {message}
      </p>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
