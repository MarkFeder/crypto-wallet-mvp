import React from 'react';
import { strings } from '../locales';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  return (
    <div className="error-fallback">
      <div className="error-content">
        <h2>{strings.errors.somethingWentWrong}</h2>
        <p className="error-message">{error?.message || strings.errors.unexpectedError}</p>
        <div className="error-actions">
          <button onClick={onReset} className="btn-primary">
            {strings.errors.tryAgain}
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            {strings.errors.reloadPage}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
