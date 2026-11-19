import type { ChangeEvent } from 'react';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function TextField({ id, label, value, error, onChange }: TextFieldProps) {
  const handle = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handle}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
