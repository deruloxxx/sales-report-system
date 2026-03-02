'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectProps = {
  label: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'required'>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    required,
    options,
    placeholder = '選択してください',
    className = '',
    id,
    ...props
  },
  ref,
) {
  const selectId = id || props.name;

  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        ref={ref}
        id={selectId}
        required={required}
        className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});
