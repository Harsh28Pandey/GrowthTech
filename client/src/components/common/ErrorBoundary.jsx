import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full shadow-sm text-center">
            <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-full mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              An unexpected error occurred while rendering the interface.
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-gray-100 p-3 rounded mb-6 text-gray-800 overflow-x-auto border border-gray-200">
                {this.state.error.toString()}
              </pre>
            )}
            <Button
              variant="primary"
              onClick={this.handleReload}
              icon={RefreshCw}
              className="w-full"
            >
              Refresh Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

