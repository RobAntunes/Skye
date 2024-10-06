import {
  assertEquals,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";
import { reactive, effect, rerender } from "./reactive.ts";

Deno.test("reactive() creates a reactive object", () => {
  const original = { count: 0 };
  const observed = reactive(original);

  assertEquals(observed.count, 0);
  original.count++; 
  assertEquals(observed.count, 1, "Changes in original should reflect in observed");
});

Deno.test("Handling asynchronous effects", async () => {
  const state = reactive({ count: 0, data: null as string | null });
  let effectCount = 0;

  effect({
    asyncEffect: () => {
      effectCount++;
      console.log("Count:", state.count);
      if (state.data === null) {
        return new Promise<void>((resolve) =>
          setTimeout(() => {
            state.data = "Loaded";
            resolve();
          }, 100)
        );
      }
      console.log("Data:", state.data);
    },
  });

  assertEquals(effectCount, 1, "Effect should run immediately");
  assertEquals(state.data, null, "Initial state should be null");

  state.count++;
  await rerender();
  assertEquals(effectCount, 2, "Effect should run after state change");

  await new Promise(resolve => setTimeout(resolve, 150));
  await rerender();
  assertEquals(state.data, "Loaded", "Data should be updated after async resolution");
  assertEquals(effectCount, 3, "Effect should rerun after async operation completes");
});