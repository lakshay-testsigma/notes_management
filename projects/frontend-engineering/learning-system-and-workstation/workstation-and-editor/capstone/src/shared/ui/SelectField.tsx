import type { ChangeEvent } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: Option[];
  error?: string;
  onChange: (value: string) => void;
}

export function SelectField({ id, label, value, options, error, onChange }: SelectFieldProps) {
  const handle = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={handle} aria-invalid={error ? true : undefined}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
