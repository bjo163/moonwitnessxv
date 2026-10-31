import { Children, cloneElement, isValidElement } from 'react'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn.js'
import { triggerHaptic, type HapticPattern } from './client/haptics.js'

export type ButtonVariant = 'primary' | 'accent' | 'cyan' | 'paper' | 'ghost' | 'danger' | 'cyber'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Label + control + help/error text, with the ARIA wiring done for you.
 *
 * `aria-describedby` (hint OR error, whichever is actually rendered) and
 * `aria-invalid` are injected into the control element passed as `children`
 * — that is how this stays non-breaking: call sites keep writing
 * `<Field htmlFor="x"><TextInput id="x" /></Field>` and need no new props.
 * Three behaviours are worth knowing, because they are not visible here:
 * 1. the ids derive from `htmlFor` (`<htmlFor>-hint` / `<htmlFor>-error`), so a
 *    `Field` without `htmlFor` renders its hint/error unlinked — the label
 *    needs it anyway;
 * 2. `children` elements that already declare `aria-describedby` /
 *    `aria-invalid` keep theirs (explicit consumer wiring wins, per attribute);
 * 3. `<input type="hidden">` children are skipped, and any wrapper element
 *    (a `div`, a Fragment) receives nothing useful — put the control as the
 *    direct child, which is what every in-repo call site already does.
 */
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
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  const showHint = Boolean(hint) && !error
  const describedBy = [showHint ? hintId : undefined, error ? errorId : undefined]
    .filter((id): id is string => Boolean(id))
    .join(' ')

  const annotated = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child
    }
    const props = child.props as { type?: unknown; 'aria-describedby'?: unknown; 'aria-invalid'?: unknown }
    if (props.type === 'hidden') {
      return child
    }
    const extra: Record<string, unknown> = {}
    if (describedBy && props['aria-describedby'] === undefined) {
      extra['aria-describedby'] = describedBy
    }
    if (error && props['aria-invalid'] === undefined) {
      extra['aria-invalid'] = 'true'
    }
    if (Object.keys(extra).length === 0) {
      return child
    }
    return cloneElement(child, extra)
  })

  return (
    <div className="m-field">
      <label className="m-field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {annotated}
      {showHint ? (
        <span id={hintId} className="m-field-hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="m-field-error">
          {error}
        </span>
      ) : null}
    </div>
  )
}

export function LocaleSelect({
  label,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  ariaLabel?: string
}): ReactNode {
  return (
    <label className="m-row" style={{ gap: 6, alignItems: 'center' }}>
      <span className="m-muted">{label}</span>
      <select
        aria-label={ariaLabel ?? label}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * The compact segmented language control a toolbar uses where a `<select>` would
 * be too wide (ADR-0017: Cockpit drew this twice in raw `<button>`s).
 *
 * `aria-pressed` carries the state, so the choice is readable without colour. The
 * group takes the focus ring because its rounded box clips an outline drawn on a
 * child, and Space stops bubbling so a page-level Space shortcut (Cockpit's play
 * toggle) cannot fire while the user is picking a language.
 */
export function LocaleToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}): ReactNode {
  return (
    <div
      className="m-locale-toggle"
      role="group"
      aria-label={label}
      onKeyDown={(event) => {
        if (event.code === 'Space') event.stopPropagation()
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="m-locale-toggle-option"
          aria-pressed={value === option.value}
          onClick={() => {
            triggerHaptic('tap')
            onChange(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
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

export function Toggle({
  label,
  haptic = true,
  onChange,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  haptic?: boolean
}): ReactNode {
  const handle = haptic || onChange
    ? (e: React.ChangeEvent<HTMLInputElement>) => {
        if (haptic) {
          triggerHaptic('switch')
        }
        onChange?.(e)
      }
    : undefined

  return (
    <label className="m-toggle">
      <input
        type="checkbox"
        onChange={handle}
        {...rest}
      />
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
  haptic,
  loading,
  disabled,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  haptic?: HapticPattern | boolean
  loading?: boolean
}): ReactNode {
  // React refuses to render a host element that carries a function prop from a
  // Server Component, and these buttons are rendered by server routes — so the
  // handler exists only when the caller actually asked for one.
  const handle = haptic || onClick
    ? (e: MouseEvent<HTMLButtonElement>) => {
        if (haptic) {
          triggerHaptic(typeof haptic === 'string' ? haptic : 'tap')
        }
        onClick?.(e)
      }
    : undefined

  return (
    <button
      className={cn('m-btn', className)}
      data-variant={variant}
      data-size={size}
      type={type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      onClick={handle}
      {...rest}
    >
      {loading ? (
        <span
          className="m-btn-loader"
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '0.85em',
            height: '0.85em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'm-spin 0.6s linear infinite',
            marginRight: '0.5em',
            verticalAlign: 'middle',
          }}
        />
      ) : null}
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  haptic,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  haptic?: HapticPattern | boolean
}): ReactNode {
  const handle = haptic || onClick
    ? (e: MouseEvent<HTMLAnchorElement>) => {
        if (haptic) {
          triggerHaptic(typeof haptic === 'string' ? haptic : 'tap')
        }
        onClick?.(e)
      }
    : undefined

  return (
    <a
      className={cn('m-btn', className)}
      data-variant={variant}
      data-size={size}
      onClick={handle}
      {...rest}
    >
      {children}
    </a>
  )
}
