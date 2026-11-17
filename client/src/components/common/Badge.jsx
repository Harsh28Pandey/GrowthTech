import React from 'react';

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variantStyles = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const currentStyle = variantStyles[variant] || variantStyles.gray;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${currentStyle} ${className}`}
    >
      {children}
    </span>
  );
};

