import * as React from 'react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, error, className = '', ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-title mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`block w-full px-3 py-2.5 bg-[var(--background-input)] border-[var(--border-default)] rounded-lg shadow-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors
          ${error
            ? 'border-error focus:ring-error focus:border-error'
            : 'focus:border-primary focus:ring-1 focus:ring-primary'
          } 
          focus:outline-none sm:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
});

export default Input;