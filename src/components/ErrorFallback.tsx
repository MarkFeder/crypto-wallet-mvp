import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  return (
    <div className="error-fallback">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p className="error-message">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="error-actions">
          <button onClick={onReset} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
