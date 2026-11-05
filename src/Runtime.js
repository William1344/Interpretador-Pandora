export function functionValue(functionId) {
  return Object.freeze({ kind: 'function', functionId });
}

export function listValue(elements = []) {
  return Object.freeze({
    kind: 'list',
    elements: Object.freeze([...elements])
  });
}

export function isFunctionValue(value) {
  return Boolean(value && value.kind === 'function' && typeof value.functionId === 'string');
}

export function isListValue(value) {
  return Boolean(value && value.kind === 'list' && Array.isArray(value.elements));
}

export function cloneRuntimeValue(value) {
  if (isListValue(value)) return listValue(value.elements.map(cloneRuntimeValue));
  if (isFunctionValue(value)) return functionValue(value.functionId);
  if (Array.isArray(value)) return value.map(cloneRuntimeValue);
  return value;
}

export function matchPattern(pattern, value) {
  if (!pattern || typeof pattern !== 'object') {
    return { matched: Object.is(pattern, value), bindings: {} };
  }

  switch (pattern.kind) {
    case 'wildcard':
      return { matched: true, bindings: {} };
    case 'literal':
      return { matched: Object.is(pattern.value, value), bindings: {} };
    case 'variable':
      return {
        matched: true,
        bindings: { [pattern.name]: cloneRuntimeValue(value) }
      };
    case 'empty-list':
      return { matched: isListValue(value) && value.elements.length === 0, bindings: {} };
    case 'list-cons': {
      if (!isListValue(value) || value.elements.length === 0) {
        return { matched: false, bindings: {} };
      }
      const head = matchPattern(pattern.head, value.elements[0]);
      if (!head.matched) return { matched: false, bindings: {} };
      const tail = matchPattern(pattern.tail, listValue(value.elements.slice(1)));
      if (!tail.matched) return { matched: false, bindings: {} };
      return { matched: true, bindings: { ...head.bindings, ...tail.bindings } };
    }
    default:
      throw new Error(`Padrão não suportado: ${pattern.kind}`);
  }
}
