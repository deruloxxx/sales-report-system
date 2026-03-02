'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';

type TextareaProps = {
  label: string;
  error?: string;
  required?: boolean;
  rows?: number;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, required, rows = 4, className = '', id, ...props },
  ref,
) {
  const textareaId = id || props.name;

  return (
    <div>
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        rows={rows}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});
