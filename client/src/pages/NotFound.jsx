import React from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { Button } from '../components/common/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  usePageTitle('Page Not Found');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center shadow-none">
        <div className="inline-flex p-3 bg-gray-100 text-gray-500 rounded-full mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">404</h1>
        <h2 className="text-lg font-semibold text-gray-800 mt-2 mb-2">Page Not Found</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          The requested page could not be located. It may have been moved or does not exist.
        </p>
        <Link to="/">
          <Button variant="primary" icon={ArrowLeft} className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

