// tests/effects_test.ts

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

Deno.test('Reactive state updates trigger render', () => {
  // Mock effect function
  const mockEffect = () => {
    // No operation, just tracking
  };

  const syncSpy = spyOn(effect, 'emit');

  // Define a synchronous effect
  effect.sync(mockEffect);

  // Emit the 'effectRun' event manually
  effect.emit('effectRun', { type: 'sync', effectFn: mockEffect });

  assertEquals(syncSpy.calls.length, 1);
  assertEquals(syncSpy.calls[0][0], 'effectRun');
  assertEquals(syncSpy.calls[0][1].type, 'sync');
  assertEquals(syncSpy.calls[0][1].effectFn, mockEffect);

  // Restore the original method
  syncSpy.restore();
});

Deno.test('Future method emits events upon completion', async () => {
  const runSpy = spyOn(effect, 'emit');
  const futureEffect = async () => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Future effect completed.');
  };

  // Define a future effect
  effect.future(futureEffect);

  // Wait for the async operation to complete
  await new Promise(resolve => setTimeout(resolve, 150));

  // Verify that 'effectRun' was emitted
  const effectRunEmitted = runSpy.calls.some(call => call[0] === 'effectRun' && call[1].type === 'future');
  const effectErrorEmitted = runSpy.calls.some(call => call[0] === 'effectError' && call[1].type === 'future');

  assertEquals(effectRunEmitted, true);
  assertEquals(effectErrorEmitted, false);

  // Define a future effect that throws an error
  const errorFutureEffect = async () => {
    await new Promise((_, reject) => setTimeout(() => reject(new Error('Future effect error.')), 100));
  };

  effect.future(errorFutureEffect);

  // Wait for the async operation to complete
  await new Promise(resolve => setTimeout(resolve, 150));

  // Verify that 'effectError' was emitted
  const effectErrorEmittedAfter = runSpy.calls.some(call => call[0] === 'effectError' && call[1].type === 'future');

  assertEquals(effectErrorEmittedAfter, true);

  // Restore the original method
  runSpy.restore();
});