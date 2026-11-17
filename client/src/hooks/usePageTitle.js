import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | Growth Tech` : 'Growth Tech | User & Access Management';
  }, [title]);
};

