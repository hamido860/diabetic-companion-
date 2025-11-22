import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-brand-surface p-4 sm:p-6 rounded-3xl shadow-lg shadow-black/20 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
