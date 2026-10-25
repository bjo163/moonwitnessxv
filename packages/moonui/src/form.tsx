import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from './cn.js'

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: ReactNode
  htmlFor?: string
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
}): ReactNode {
  return (
    <div className="m-field">
      <label className="m-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error ? <span className="m-field-hint">{hint}</span> : null}
      {error ? <span className="m-field-error">{error}</span> : null}
    </div>
  )
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>): ReactNode {
  return <input className={cn('m-input', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>): ReactNode {
  return <textarea className={cn('m-textarea', className)} {...rest} />
}

export function SelectInput({
  options,
  placeholder,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[]
  placeholder?: string
}): ReactNode {
  return (
    <select className={cn('m-select', className)} {...rest}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function Toggle({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }): ReactNode {
  return (
    <label className="m-toggle">
      <input type="checkbox" {...rest} />
      {label}
    </label>
  )
}

export function Button({
  variant,
  type,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }): ReactNode {
  return (
    <button className={cn('m-btn', className)} data-variant={variant} type={type ?? 'button'} {...rest}>
      {children}
    </button>
  )
}
