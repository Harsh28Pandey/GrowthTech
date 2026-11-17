import React from 'react';

export const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className={`spinner ${sizeMap[size] || sizeMap.md} mb-3`} />
      {text && <p className="text-xs text-gray-500 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-none z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

