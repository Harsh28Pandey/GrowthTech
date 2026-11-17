import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      id,
      name,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative rounded-md">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            className={`block w-full rounded-md border text-sm text-gray-900 bg-white placeholder-gray-400 transition-colors py-2 ${
              LeftIcon ? 'pl-9' : 'pl-3'
            } ${RightIcon ? 'pr-9' : 'pr-3'} ${
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            } disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
            {...props}
          />
          {RightIcon && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onRightIconClick}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 ${
                onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <RightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

