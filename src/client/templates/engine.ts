import { effect } from "../reactivity/reactive.ts";

export function parseTemplate(template: string, state: Record<string, any> = {}): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const bindings: Array<{ node: Text; expression: string }> = [];

  let index = 0;
  const length = template.length;

  while (index < length) {
    const openIndex = template.indexOf('{{', index);

    if (openIndex === -1) {
      // Append remaining text
      const text = template.slice(index);
      fragment.appendChild(document.createTextNode(text));
      break;
    }

    // Append text before the expression
    if (openIndex > index) {
      const text = template.slice(index, openIndex);
      fragment.appendChild(document.createTextNode(text));
    }

    // Find the closing '}}'
    const closeIndex = template.indexOf('}}', openIndex + 2);
    if (closeIndex === -1) {
      // No closing '}}', append the rest as text
      const text = template.slice(openIndex);
      fragment.appendChild(document.createTextNode(text));
      break;
    }

    // Extract and evaluate the expression
    const expression = template.slice(openIndex + 2, closeIndex).trim();
    const textNode = document.createTextNode('');
    fragment.appendChild(textNode);

    // Evaluate and set initial value
    updateTextNode(textNode, expression, state);

    // Keep track of bindings for reactivity
    bindings.push({ node: textNode, expression });

    // Move the index past the closing '}}'
    index = closeIndex + 2;
  }

  // Set up reactivity for each binding
  bindings.forEach(({ node, expression }) => {
    effect({
      update() {
        updateTextNode(node, expression, state);
      },
    });
  });

  return fragment;
}

function updateTextNode(node: Text, expression: string, state: Record<string, any>) {
  try {
    const value = new Function(...Object.keys(state), `return ${expression};`)(...Object.values(state));
    node.textContent = value;
  } catch (error) {
    console.error(`Error evaluating expression "${expression}":`, error);
    node.textContent = '';
  }
}

export function html(strings: string[], ...expressions: any[]) {
  // Combine strings and expressions
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < expressions.length) {
      const expr = expressions[i];
      // If the expression is a function, execute it
      if (typeof expr === 'function') {
        result += expr();
      } else {
        result += expr;
      }
    }
  }
  return result;
}

export function parseTemplateString(templateString: string) {
  // Create a template element
  const template = document.createElement('template');
  template.innerHTML = templateString.trim();

  // Return the content of the template as a DocumentFragment
  return template.content.cloneNode(true);
}