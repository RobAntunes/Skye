import { Interceptor } from "../../core/base/events/Intercepted.ts";
import { reactive, effect } from "../../core/base/reactivity/reactive.ts"; // Adjust import path as needed
import { assertEquals } from "jsr:@std/assert";

Deno.test("Effect should log count when state changes", () => {
  const state = reactive({
    count: 0,
  });

  let logOutput = "";

  effect({
    logCount() {
      logOutput = `Count is: ${state.count}`;
    },
  });

  state.count++; // This should trigger the effect

  assertEquals(logOutput, "Count is: 1");
});

Deno.test("Effect should not trigger if non-relevant state changes", () => {
  const state = reactive({
    count: 0,
    other: 0,
  });

  let logOutput = "";

  effect({
    logCount() {
      logOutput = `Count is: ${state.count}`;
    },
  });

  state.other++; // Changing `other` should not trigger the effect

  assertEquals(logOutput, "Count is: 0"); // Should remain unchanged
});

Deno.test("Effect should react to multiple state properties", () => {
  const state = reactive({
    count: 0,
    multiplier: 2,
  });

  let computedResult = 0;

  effect({
    computeTotal() {
      computedResult = state.count * state.multiplier;
    },
  });

  state.count = 5;
  state.multiplier = 3;

  assertEquals(computedResult, 15); // Should correctly compute 5 * 3
});

Deno.test(
  "Event system should allow multiple listeners for the same event",
  () => {
    const interceptor = new Interceptor<"foo" | "bar">();

    let fooResult1 = "";
    let fooResult2 = "";

    interceptor.on("foo", (value) => {
      fooResult1 = value;
    });

    interceptor.on("foo", (value) => {
      fooResult2 = value;
    });

    interceptor.trigger("foo", "Multiple Foo Listeners");

    assertEquals(fooResult1, "Multiple Foo Listeners");
    assertEquals(fooResult2, "Multiple Foo Listeners");
  }
);
