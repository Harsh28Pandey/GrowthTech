import React from 'react';

export const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = 'gray',
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-none">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        {Icon && (
          <div className="p-2 bg-gray-50 text-gray-600 rounded border border-gray-200">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {value !== undefined && value !== null ? value : '—'}
        </div>
        {badgeText && (
          <span className="text-xs font-medium text-gray-500">{badgeText}</span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-gray-400 leading-tight">{description}</p>
      )}
    </div>
  );
};

