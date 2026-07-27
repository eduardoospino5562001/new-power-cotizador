import type { InputHTMLAttributes } from 'react'

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function NumberInput({ label, error, className = '', id, ...props }: NumberInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        className={`rounded-lg border px-3 py-2 text-sm text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange ${
          error ? 'border-red-500' : 'border-brand-orange-light'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
