import type { ReactNode } from 'react'
import { WIDGET_KINDS, fieldWidgetFor, type FieldWidgetProps } from '@moonwitness/moonui'
import type { WidgetProps } from './widgets'

/**
 * THE widget registry now lives in `@moonwitness/moonui` (`FIELD_WIDGETS`), because
 * the hub's Studio renders the very same `/_schema` metadata and had to keep its own
 * answer. This file is the local door: HQ components import `FieldWidget` from here,
 * and the mapping it delegates to is shared with every other surface.
 */
export { WIDGET_KINDS }
export type { FieldWidgetProps }

export function FieldWidget({ kind, ...props }: WidgetProps & { kind: string }): ReactNode {
  const Widget = fieldWidgetFor(kind)
  return <Widget {...(props as FieldWidgetProps)} />
}
