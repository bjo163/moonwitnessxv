import type { FieldOption, FieldWidgetProps } from '@moonwitness/moonui'
import { BoolField, IntField, M2oField, SelField, StrField, TextField, TsField } from '@moonwitness/moonui'

/**
 * Headquarters used to own these seven controls and the kind→control map, which made
 * it the only surface that knew how to render `/_schema` — the hub's Studio had to
 * guess. Both now come from `@moonwitness/moonui`, so this file is only the local
 * spelling of the two types HQ code already imports.
 */
export type WidgetProps = FieldWidgetProps
export type { FieldOption }

export { BoolField, IntField, M2oField, SelField, StrField, TextField, TsField }
