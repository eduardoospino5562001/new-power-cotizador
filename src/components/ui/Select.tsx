import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`rounded-lg border px-3 py-2 text-sm text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange ${
          error ? 'border-red-500' : 'border-brand-orange-light'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
