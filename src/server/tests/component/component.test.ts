// tests/component_test.ts

import { UserProfile } from '../../../example/components/User.ts';
import { effect } from '../../core/base/reactivity/Effects.ts';
import { assertEquals } from "jsr:@std/assert";

/**
 * Utility function to spy on methods.
 */
function spyOn(obj: any, method: string) {
  const original = obj[method];
  const calls: any[] = [];
  obj[method] = (...args: any[]) => {
    calls.push(args);
    return original.apply(obj, args);
  };
  return {
    get calls() {
      return calls;
    },
    restore() {
      obj[method] = original;
    },
  };
}

/**
 * Define a TestComponent for testing purposes.
 */
class TestComponent extends UserProfile {
  constructor() {
    super();
  }
}

customElements.define('test-component', TestComponent);

Deno.test('Component renders initial state correctly', () => {
  // Create an instance of TestComponent with initial state
  const component = new TestComponent();
  component.state = {
    user: null,
    loading: false,
    error: null,
  };

  // Append to the DOM
  document.body.appendChild(component);

  // Assert initial render
  const paragraph = component.shadowRoot!.querySelector('p')!;
  assertEquals(paragraph.textContent, 'Message: Initial Message'); // Adjust based on actual template

  // Cleanup
  document.body.removeChild(component);
});

Deno.test('Component updates render when state changes', async () => {
  // Create an instance of TestComponent with initial state
  const component = new TestComponent();
  component.state = {
    user: null,
    loading: false,
    error: null,
  };

  // Append to the DOM
  document.body.appendChild(component);

  // Assert initial render
  let paragraph = component.shadowRoot!.querySelector('p')!;
  assertEquals(paragraph.textContent, 'Message: Initial Message'); // Adjust based on actual template

  // Simulate asynchronous state update
  component.state.message = 'Updated Message';

  // Wait for the effect to trigger
  await new Promise(resolve => setTimeout(resolve, 150));

  // Assert updated render
  paragraph = component.shadowRoot!.querySelector('p')!;
  assertEquals(paragraph.textContent, 'Message: Updated Message');

  // Cleanup
  document.body.removeChild(component);
});

Deno.test('Component handles future effects correctly', async () => {
  // Create an instance of TestComponent with initial state
  const component = new TestComponent();
  component.state = {
    user: null,
    loading: false,
    error: null,
    message: 'Initial Message',
  };

  // Spy on the emit method
  const emitSpy = spyOn(effect, 'emit');

  // Append to the DOM
  document.body.appendChild(component);

  // Define a future effect to update the message
  effect.future(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    component.state.message = 'Future Message';
  });

  // Wait for the future effect to complete
  await new Promise(resolve => setTimeout(resolve, 150));

  // Assert that the message was updated
  const paragraph = component.shadowRoot!.querySelector('p')!;
  assertEquals(paragraph.textContent, 'Message: Future Message');

  // Verify that 'effectRun' was emitted
  const effectRunEmitted = emitSpy.calls.some(call => call[0] === 'effectRun' && call[1].type === 'future');
  assertEquals(effectRunEmitted, true);

  // Cleanup
  emitSpy.restore();
  document.body.removeChild(component);
});