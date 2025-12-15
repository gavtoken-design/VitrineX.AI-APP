import * as React from 'react';
import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-sm focus:ring-primary',
    secondary: 'bg-surface text-title border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary/5 focus:ring-primary',
    ghost: 'bg-transparent text-body hover:bg-gray-100 hover:text-title focus:ring-gray-200',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="w-4 h-4 mr-2 border-current border-t-transparent opacity-80" />
          <span>Processando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;