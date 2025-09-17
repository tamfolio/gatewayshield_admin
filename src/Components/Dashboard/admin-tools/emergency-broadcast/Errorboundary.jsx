import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                There was an error loading the Emergency Broadcast form. Please try refreshing the page.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ml-3"
                >
                  Try Again
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left bg-gray-50 p-4 rounded-md">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;