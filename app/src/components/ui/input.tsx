'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = {
  label: string;
  error?: string;
  required?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'required'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, required, className = '', id, ...props },
  ref,
) {
  const inputId = id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});
