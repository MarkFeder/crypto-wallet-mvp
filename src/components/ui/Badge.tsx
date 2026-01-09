import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'currency' | 'status';
  status?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  className = '',
}) => {
  const baseClass = variant === 'status' ? 'status-badge' : `${variant}-badge`;
  const statusClass = status || '';
  const classes = [baseClass, statusClass, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;
