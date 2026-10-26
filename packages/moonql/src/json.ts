/**
 * The bag shape the metadata layer walks (schema properties, JSON Schema nodes).
 *
 * Declared three times before (`codegen`, `introspect`, `jsonschema`); keeping it
 * wide on purpose — the documents are assembled from many shapes and narrowed at
 * the point of use.
 */
export type Json = Record<string, unknown>
