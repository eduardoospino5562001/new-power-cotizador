import type { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-brand-dark">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`rounded-lg border px-3 py-2 text-sm text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange resize-y min-h-[80px] ${
          error ? 'border-red-500' : 'border-brand-orange-light'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
