import { assertEquals } from "jsr:@std/assert";
import { realTimeUpdate } from "../../core/base/realTime/updates.ts";

// Add this to the top of your `realTime/updates.test.ts` file
(globalThis as any).requestAnimationFrame = (cb: () => void) => setTimeout(cb, 16);

Deno.test("UI re-rendering is triggered after state updates", async () => {
  let renderCount = 0;

  // Simulate a UI rerender function
  function scheduleRerender() {
    renderCount += 1;
  }

  // Update state and ensure rerender is triggered
  realTimeUpdate(() => {
    scheduleRerender();
  });

  // Use setTimeout to delay the assertion until after the mocked requestAnimationFrame is called
  await new Promise(resolve => setTimeout(resolve, 20));

  assertEquals(renderCount, 1, "UI should re-render after state update");
});

Deno.test("Batched updates run effects efficiently", async () => {
  let effectCount = 0;

  function runEffect() {
    effectCount += 1;
  }

  // Update state in a batched manner and ensure effects are triggered
  realTimeUpdate(() => {
    runEffect();  // First batch
    runEffect();  // Second batch
  });

  // Wait to ensure all batched effects are executed
  await new Promise(resolve => setTimeout(resolve, 20));

  assertEquals(effectCount, 2, "All batched effects should run once after updates");
});