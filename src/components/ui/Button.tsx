import * as React from 'react';
import { ButtonHTMLAttributes } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'liquid';
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
    primary: 'bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/20 border border-white/10 focus:ring-offset-2 focus:ring-black dark:focus:ring-white',
    secondary: 'bg-surface text-title border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 focus:ring-gray-200',
    outline: 'bg-transparent border border-primary/50 text-primary hover:bg-primary/5 focus:ring-primary',
    ghost: 'bg-transparent text-body hover:bg-gray-100 dark:hover:bg-white/5 hover:text-title focus:ring-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 focus:ring-red-500',
    liquid: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/40 border border-white/20 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]',
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