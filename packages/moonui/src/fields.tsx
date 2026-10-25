import type { ReactNode } from 'react'
import { Field, SelectInput, TextInput, Textarea, Toggle } from './form.js'

/**
 * The metadata-driven field registry, in the shared kit.
 *
 * It used to live inside headquarters, which meant the hub's own Studio had to
 * re-derive "what control does this schema property want?" by hand — the classic
 * drift, where the app that owns the design system renders one answer and the app
 * that renders the same metadata renders another.
 *
 * So there are two exports here and ONE table behind them:
 * - `FIELD_WIDGETS` — kind (from `/_schema`) to React control, for the apps;
 * - the schema-property side of the decision lives in `@moonwitness/core`
 *   (`FIELD_INPUT_SPEC`, `inputKindFor`), so the zero-build Studio page and this kit
 *   read the same answer from a package neither of them owns.
 */

export interface FieldOption {
  value: string
  label: string
}

/** what every field control receives; `name` carries the kind (`genre::sel`) */
export interface FieldWidgetProps {
  name: string
  id: string
  label: string
  value: string
  required?: boolean
  hint?: string
  enumValues?: string[]
  maxLength?: number
  options?: FieldOption[]
}

export function StrField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint}>
      <TextInput id={props.id} name={props.name} defaultValue={props.value} required={props.required} maxLength={props.maxLength} />
    </Field>
  )
}

export function TextField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint}>
      <Textarea id={props.id} name={props.name} defaultValue={props.value} required={props.required} />
    </Field>
  )
}

export function IntField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint}>
      <TextInput id={props.id} name={props.name} type="number" defaultValue={props.value} required={props.required} />
    </Field>
  )
}

export function TsField(props: FieldWidgetProps): ReactNode {
  const local = props.value ? props.value.slice(0, 16) : ''
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint ?? 'ISO timestamp'}>
      <TextInput id={props.id} name={props.name} type="datetime-local" defaultValue={local} required={props.required} />
    </Field>
  )
}

export function SelField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint}>
      <SelectInput
        id={props.id}
        name={props.name}
        defaultValue={props.value}
        required={props.required}
        placeholder={props.required ? undefined : '—'}
        options={(props.enumValues ?? []).map((value) => ({ value, label: value }))}
      />
    </Field>
  )
}

export function M2oField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint ?? 'relation'}>
      <SelectInput id={props.id} name={props.name} defaultValue={props.value} required={props.required} placeholder="—" options={props.options ?? []} />
    </Field>
  )
}

export function BoolField(props: FieldWidgetProps): ReactNode {
  return (
    <Field label={props.label} htmlFor={props.id} hint={props.hint}>
      {/* hidden first, checkbox last: FormData keeps the last value, so "off" is representable */}
      <input type="hidden" name={props.name} value="false" />
      <Toggle id={props.id} name={props.name} value="on" defaultChecked={props.value === 'true'} label="enabled" />
    </Field>
  )
}

type WidgetComponent = (props: FieldWidgetProps) => ReactNode

/** `FieldMeta.kind` picks the control. Add a kind here and every form learns it. */
export const FIELD_WIDGETS: Record<string, WidgetComponent> = {
  str: StrField,
  text: TextField,
  int: IntField,
  bool: BoolField,
  ts: TsField,
  sel: SelField,
  m2o: M2oField,
}

export const WIDGET_KINDS = Object.keys(FIELD_WIDGETS)

/** The one call sites use: pick the widget for a kind, defaulting to text. */
export function fieldWidgetFor(kind: string): WidgetComponent {
  return FIELD_WIDGETS[kind] ?? StrField
}