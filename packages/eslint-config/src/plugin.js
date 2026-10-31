/**
 * packages/eslint-config/src/plugin.js
 *
 * Custom ESLint Plugin for Moonwitness Epistemic Guardrails & Token Purity.
 *
 * Rules:
 * - `no-theological-sameas`: Bans asserting automatic theological equivalence (M09-03/04).
 * - `require-rights-veto`: Enforces rights status checks before passage bytes access.
 * - `enforce-token-purity`: Flags hardcoded rogue hex colors violating MoonUI tokens.
 * - `shared-ui-only`: Bans app-local primitive components and raw interactive markup (ADR-0017).
 */

const ROGUE_HEX_MAP = {
  '#00e5ff': 'var(--cyan) (#00d4ff)',
  '#00ffff': 'var(--cyan) (#00d4ff)',
  '#22d3ee': 'var(--cyan) (#00d4ff)',
  '#38bdf8': 'var(--cyan) (#00d4ff)',
  '#ff2a85': 'var(--pink) (#ff007a)',
  '#ff1493': 'var(--pink) (#ff007a)',
  '#ff85a1': 'var(--hot) (#ff1e56)',
  '#e11d48': 'var(--hot) (#ff1e56)',
  '#10b981': 'var(--ok) (#00e676)',
  '#f59e0b': 'var(--accent) (#ffd400)',
}

/** Intrinsic elements that already have a MoonUI owner (ADR-0017 R1). */
const SHARED_INTRINSIC_ELEMENTS = {
  button: 'Button or LinkButton',
  input: 'TextInput or Toggle',
  select: 'SelectInput',
  textarea: 'Textarea',
  dialog: 'Modal or AlertDialog',
  table: 'DataTable',
}

function normalizeFilename(filename) {
  return String(filename ?? '').split('\\').join('/')
}

export const moonwitnessPlugin = {
  meta: {
    name: '@moonwitness/eslint-plugin-moonwitness',
    version: '1.0.0',
  },
  rules: {
    'no-theological-sameas': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce M09-03/04 theological non-equivalence guardrails. Automatic sameAs is banned without human reviewer evidence.',
        },
        schema: [],
      },
      create(context) {
        return {
          Property(node) {
            const keyName = node.key && (node.key.name || node.key.value)
            if (keyName === 'relationType' && node.value && node.value.value === 'sameAs') {
              const parent = node.parent
              const statusProp =
                parent &&
                parent.properties &&
                parent.properties.find(
                  (p) => p.key && (p.key.name === 'status' || p.key.value === 'status')
                )
              const statusVal = statusProp && statusProp.value && statusProp.value.value

              // If an active relation, or an approved candidate asserts sameAs directly
              if (!statusVal || statusVal === 'APPROVED') {
                context.report({
                  node,
                  message: "M09-03/04 Violation: 'relationType: sameAs' cannot be approved directly. Theological concepts must remain distinct until reviewed with positive evidence.",
                })
              }
            }
          },
        }
      },
    },

    'require-rights-veto': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Ensure passage citations check licenseStatus or rightsStatus before exposing text bytes.',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee &&
              node.callee.name === 'createPassageCitation' &&
              node.arguments.length < 2
            ) {
              context.report({
                node,
                message: 'createPassageCitation requires explicit license status parameter.',
              })
            }
          },
        }
      },
    },

    'enforce-token-purity': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Enforce MoonUI design token purity. Disallow drifted or rogue hex colors.',
        },
        schema: [],
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              const lower = node.value.toLowerCase().trim()
              if (ROGUE_HEX_MAP[lower]) {
                context.report({
                  node,
                  message: `Design Token Drift: Hardcoded hex color '${node.value}' is forbidden. Use ${ROGUE_HEX_MAP[lower]} from Moon UI tokens instead.`,
                })
              }
            }
          },
        }
      },
    },

    /**
     * ADR-0017 — MoonUI is the only component owner.
     *
     * `ImportBoundary` catches a consumer that hand-rolls markup for a primitive
     * MoonUI already ships. `LocalPrimitive` catches a consumer that declares a
     * component whose name MoonUI already owns. Both are scoped by the caller:
     * `exceptions` carries the ADR-0017 ledger paths, `ignoreBasenames` carries
     * route shells, which are composition roots rather than components.
     */
    'shared-ui-only': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require MoonUI primitives instead of app-local components and raw interactive markup.',
        },
        messages: {
          importBoundary:
            "ADR-0017: use <{{suggestion}}> from '@moonwitness/moonui' instead of a raw <{{tag}}> element.",
          localPrimitive:
            "ADR-0017: '{{name}}' is owned by @moonwitness/moonui; import it instead of declaring a local component.",
        },
        schema: [
          {
            type: 'object',
            properties: {
              names: { type: 'array', items: { type: 'string' } },
              exceptions: { type: 'array', items: { type: 'string' } },
              ignoreBasenames: { type: 'array', items: { type: 'string' } },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const options = context.options[0] ?? {}
        const sharedNames = new Set(options.names ?? [])
        const exceptions = (options.exceptions ?? []).map(normalizeFilename)
        const ignoreBasenames = options.ignoreBasenames ?? []
        const filename = normalizeFilename(context.filename ?? context.getFilename?.())

        if (ignoreBasenames.some((basename) => filename.endsWith(`/${basename}`) || filename.endsWith(basename))) {
          return {}
        }
        if (exceptions.some((path) => filename.endsWith(`/${path}`) || filename.endsWith(path))) {
          return {}
        }

        const checkName = (node) => {
          if (!node || node.type !== 'Identifier') return
          if (!sharedNames.has(node.name)) return
          context.report({ node, messageId: 'localPrimitive', data: { name: node.name } })
        }

        return {
          JSXOpeningElement(node) {
            if (node.name.type !== 'JSXIdentifier') return
            const tag = node.name.name
            const suggestion = SHARED_INTRINSIC_ELEMENTS[tag]
            if (!suggestion) return
            // A hidden field is form plumbing: it renders nothing, so it has no
            // primitive to consolidate (ADR-0017 ImportBoundary).
            if (tag === 'input') {
              const typeAttr = node.attributes.find(
                (attr) =>
                  attr.type === 'JSXAttribute' &&
                  attr.name.type === 'JSXIdentifier' &&
                  attr.name.name === 'type',
              )
              const value =
                typeAttr && typeAttr.value && typeAttr.value.type === 'Literal'
                  ? typeAttr.value.value
                  : null
              if (value === 'hidden') return
            }
            context.report({ node: node.name, messageId: 'importBoundary', data: { tag, suggestion } })
          },
          FunctionDeclaration(node) {
            checkName(node.id)
          },
          VariableDeclarator(node) {
            checkName(node.id)
          },
        }
      },
    },
  },
}

export { SHARED_INTRINSIC_ELEMENTS }
export default moonwitnessPlugin
