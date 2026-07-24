// A deliberately minimal JSON Schema subset checker — just enough to cover
// the keywords used by .schemas/*.json (type, required, properties,
// additionalProperties, pattern, enum, minLength, maxLength, items,
// minItems). Not a general-purpose validator; this repo has no npm
// dependencies on purpose, so we don't pull in ajv for three small schemas.

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

/** Validates `data` against `schema`, returning an array of error strings. */
export function checkSchema(schema, data, pathLabel = '') {
  const errors = [];
  const label = pathLabel || '(root)';

  if (schema.type && typeOf(data) !== schema.type) {
    errors.push(`${label}: expected type "${schema.type}", got "${typeOf(data)}"`);
    return errors; // further checks would be meaningless
  }

  if (schema.type === 'object' || (!schema.type && typeOf(data) === 'object')) {
    for (const key of schema.required ?? []) {
      if (!(key in data) || data[key] === undefined || data[key] === '') {
        errors.push(`${label}: missing required property "${key}"`);
      }
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(data)) {
        if (!allowed.has(key)) {
          errors.push(`${label}: unexpected property "${key}"`);
        }
      }
    }
    for (const [key, subSchema] of Object.entries(schema.properties ?? {})) {
      if (data[key] === undefined) continue;
      errors.push(...checkSchema(subSchema, data[key], `${label}.${key}`));
    }
    return errors;
  }

  if (schema.type === 'array') {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${label}: expected at least ${schema.minItems} item(s)`);
    }
    if (schema.items) {
      data.forEach((item, index) => {
        errors.push(...checkSchema(schema.items, item, `${label}[${index}]`));
      });
    }
    return errors;
  }

  if (schema.type === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${label}: shorter than minLength ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push(`${label}: longer than maxLength ${schema.maxLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${label}: does not match pattern ${schema.pattern}`);
    }
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`${label}: "${data}" is not one of [${schema.enum.join(', ')}]`);
    }
  }

  return errors;
}
