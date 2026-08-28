import { Fragment, type ReactNode } from "react";

// Fills a "{token}" template with arbitrary React nodes, independent of token order —
// translated templates may reorder tokens to fit the target language's grammar.
export function renderTemplate(template: string, values: Record<string, ReactNode>) {
  return template.split(/(\{[a-zA-Z]+\})/g).map((part, i) => {
    const match = part.match(/^\{([a-zA-Z]+)\}$/);
    if (match && match[1] in values) {
      return <Fragment key={i}>{values[match[1]]}</Fragment>;
    }
    return part;
  });
}

// Plain-string variant for attributes and non-JSX contexts.
export function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, k) =>
    k in values ? String(values[k]) : m,
  );
}
