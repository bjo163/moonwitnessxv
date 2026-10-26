/**
 * packages/eslint-config/src/plugin.js
 *
 * Custom ESLint Plugin for Moonwitness Epistemic Guardrails & Token Purity.
 *
 * Rules:
 * - `no-theological-sameas`: Bans asserting automatic theological equivalence (M09-03/04).
 * - `require-rights-veto`: Enforces rights status checks before passage bytes access.
 * - `enforce-token-purity`: Flags hardcoded rogue hex colors violating MoonUI tokens.
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
  },
}

export default moonwitnessPlugin
