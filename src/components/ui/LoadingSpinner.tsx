import * as React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`inline-block ${className} border-2 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;