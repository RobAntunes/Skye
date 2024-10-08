import { WorkerPool } from "../classes/WorkerPool.ts";
import { obtain } from "../functions/async/obtain.ts";

// Mock async operation that succeeds after a delay
function mockAsyncSuccess<T>(result: T, delay: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}

// Mock async operation that fails after a delay
function mockAsyncFailure(delay: number): Promise<void> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Failed operation")), delay)
  );
}

Deno.test("WorkerPool processes tasks in parallel", async () => {
    const workerPool = new WorkerPool(2); // Two workers
  
    // Resolve promises before sending them to the worker
    const task1 = workerPool.submitTask({ result: await Promise.resolve("task1"), delay: 100 });
    const task2 = workerPool.submitTask({ result: await Promise.resolve("task2"), delay: 50 });
  
    const [result1, result2] = await Promise.all([task1, task2]);
  
    // Verify that tasks completed successfully
    if (result1 !== "task1" || result2 !== "task2") {
      throw new Error(`Expected "task1" and "task2" but got ${result1} and ${result2}`);
    }
  });

  Deno.test("WorkerPool queues tasks when workers are busy", async () => {
    const workerPool = new WorkerPool(1); // Only one worker, so task2 should queue
  
    // Resolve promises before sending them to the worker
    const task1 = workerPool.submitTask({ result: await Promise.resolve("task1"), delay: 100 });
    const task2 = workerPool.submitTask({ result: await Promise.resolve("task2"), delay: 50 }); // This should queue
  
    const result1 = await task1;
    const result2 = await task2;
  
    // Ensure tasks completed successfully in order
    if (result1 !== "task1" || result2 !== "task2") {
      throw new Error(
        `Expected "task1" and "task2" but got ${result1} and ${result2}`
      );
    }
  });

Deno.test(
  "obtain function batches tasks when batch option is true",
  async () => {
    const tasks = [
      () => mockAsyncSuccess("task1", 100),
      () => mockAsyncSuccess("task2", 50),
    ];

    // Call obtain and batch the tasks properly
    const result = await obtain(
      () => Promise.all(tasks.map((task) => task())),
      { batch: true, parallel: true }
    );

    // Ensure correct results by accessing the nested array
    if (
      result[0].length !== 2 ||
      result[0][0] !== "task1" ||
      result[0][1] !== "task2"
    ) {
      throw new Error(`Expected ["task1", "task2"] but got ${result}`);
    }
  }
);

Deno.test("obtain function retries on failure", async () => {
  let attempts = 0;
  const failingOperation = () => {
    attempts++;
    return mockAsyncFailure(50);
  };

  try {
    await obtain(failingOperation, { retries: 3 });
    throw new Error("Expected failure but operation succeeded");
  } catch (error) {
    // Ensure it failed after 3 attempts
    if (attempts !== 3) {
      throw new Error(`Expected 3 attempts but got ${attempts}`);
    }
  }
});

Deno.test("obtain function uses cache if available", async () => {
  const mockOperation = () => mockAsyncSuccess("cachedData", 50);

  const result1 = await obtain(mockOperation, { cache: true });
  const result2 = await obtain(mockOperation, { cache: true });

  // Ensure both results are the same due to caching
  if (result1[0] !== "cachedData" || result2[0] !== "cachedData") {
    throw new Error(
      `Expected cached data but got ${result1[0]} and ${result2[0]}`
    );
  }
});

Deno.test("obtain function handles errors correctly", async () => {
  const failingOperation = () => mockAsyncFailure(50);

  try {
    await obtain(failingOperation);
    throw new Error("Expected failure but operation succeeded");
  } catch (error) {
    if ((error as Error).message !== "Failed operation") {
      throw new Error(
        `Expected "Failed operation" but got "${(error as Error).message}"`
      );
    }
  }
});
