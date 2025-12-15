import * as React from 'react';
import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-title mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`block w-full px-3 py-2.5 bg-surface border border-gray-200 rounded-lg shadow-sm text-body placeholder-muted 
        focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors sm:text-sm resize-y ${className}`}
        {...props}
      ></textarea>
    </div>
  );
};

export default Textarea;