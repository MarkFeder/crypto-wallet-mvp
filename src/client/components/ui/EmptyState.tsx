import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, className = '' }) => {
  const classes = ['empty-state', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p>
        {icon && `${icon} `}
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
