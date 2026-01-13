import React from 'react';

interface CardProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', onClick, children }) => {
  const baseClass = 'card';
  const classes = [baseClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
