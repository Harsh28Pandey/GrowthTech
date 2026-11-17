import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const variantStyles = {
    primary:
      'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800',
    secondary:
      'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    danger:
      'bg-red-600 text-white border-red-600 hover:bg-red-700 active:bg-red-800',
    outline:
      'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',
    ghost:
      'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 spinner mr-2 inline-block border-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

