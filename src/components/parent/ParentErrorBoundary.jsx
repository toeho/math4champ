import React from 'react';
import { useNavigate } from 'react-router-dom';

class ParentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Parent Portal Error:', error, errorInfo);
    this.setState({ errorInfo });
    // Log to error tracking service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/parent/dashboard';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h2>
              
              <p className="text-white/80 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-900/30 rounded-lg text-left">
                  <p className="text-sm text-red-200 font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleGoBack}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                           transition-colors duration-200 font-medium"
                  aria-label="Go back to previous page"
                >
                  Go Back
                </button>
                
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-white hover:bg-white/90 text-purple-700 rounded-lg 
                           transition-colors duration-200 font-medium"
                  aria-label="Return to dashboard"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ParentErrorBoundary;
