import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn.js'

export type ButtonVariant = 'primary' | 'accent' | 'cyan' | 'paper' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

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

export function TextInput({
  className,
  icon,
  suffix,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode
  suffix?: ReactNode
}): ReactNode {
  if (icon || suffix) {
    return (
      <div className={cn('m-input-group', className)}>
        {icon ? (
          <span className="m-input-affix" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <input className="m-input m-input-bare" {...rest} />
        {suffix ? (
          <span className="m-input-affix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
    )
  }
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
  size = 'md',
  type,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}): ReactNode {
  return (
    <button
      className={cn('m-btn', className)}
      data-variant={variant}
      data-size={size}
      type={type ?? 'button'}
      {...rest}
    >
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}): ReactNode {
  return (
    <a className={cn('m-btn', className)} data-variant={variant} data-size={size} {...rest}>
      {children}
    </a>
  )
}
