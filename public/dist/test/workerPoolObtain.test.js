// src/client/classes/WorkerPool.ts
var WorkerPool = class {
  constructor(maxWorkers, workers = [], taskQueue = []) {
    this.maxWorkers = maxWorkers;
    this.workers = workers;
    this.taskQueue = taskQueue;
    for (let i = 0; i < this.maxWorkers; i++) {
      const workerCode = `
          self.onmessage = async (event) => {
            const { result, delay } = event.data;
            // Simulate async task with delay
            await new Promise(resolve => setTimeout(resolve, delay || 100));
            self.postMessage({ result });
          };
        `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob), { type: "module" });
      worker.onmessage = this.handleWorkerMessage.bind(this, i);
      this.workers.push({ worker, idle: true });
    }
  }
  handleWorkerMessage(workerIndex, event) {
    const { result } = event.data;
    console.log(result);
    this.workers[workerIndex].idle = true;
    this.assignTask();
  }
  submitTask(taskData) {
    return new Promise((resolve, reject) => {
      const assignToWorker = () => {
        for (const workerWrapper of this.workers) {
          if (workerWrapper.idle) {
            workerWrapper.idle = false;
            workerWrapper.worker.postMessage({ result: taskData.result, delay: taskData.delay });
            workerWrapper.worker.onmessage = (event) => {
              resolve(event.data.result);
              workerWrapper.idle = true;
              this.assignTask();
            };
            workerWrapper.worker.onerror = (error) => {
              reject(error);
              workerWrapper.idle = true;
              this.assignTask();
            };
            return;
          }
        }
        this.taskQueue.push(() => this.submitTask(taskData).then(resolve).catch(reject));
      };
      assignToWorker();
    });
  }
  assignTask() {
    if (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task)
        task();
    }
  }
};

// src/client/functions/async/obtain.ts
function obtain(asyncOperation, options = {}) {
  const {
    cache = true,
    paginate = false,
    maxCacheAge = 6e4,
    retries = 3,
    parallel = false,
    maxWorkers = 4,
    batch = false
  } = options;
  let cacheData = null;
  return new Promise((resolve, reject) => {
    try {
      if (cache && cacheData) {
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < maxCacheAge) {
          resolve(cacheData.result);
          return;
        }
      }
      let result;
      if (parallel) {
        const workerPool = new WorkerPool(maxWorkers);
        result = new Promise((resolve2, reject2) => {
          if (batch) {
            const taskPromises = [asyncOperation, asyncOperation].map(async (task) => {
              const resolvedResult = await task();
              return workerPool.submitTask({ result: resolvedResult, delay: 100 });
            });
            Promise.all(taskPromises).then((resolvedTasks) => resolve2(resolvedTasks)).catch(reject2);
          } else {
            asyncOperation().then((resolvedResult) => {
              workerPool.submitTask({ result: resolvedResult, delay: 100 }).then((result2) => resolve2([result2])).catch(reject2);
            });
          }
        });
      } else {
        result = batch ? Promise.all([retryOperation(asyncOperation, retries)]).then((res) => res) : retryOperation(asyncOperation, retries).then((result2) => [result2]);
      }
      if (cache) {
        cacheData = { result, timestamp: Date.now() };
      }
      if (paginate) {
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
async function retryOperation(operation, retries) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed. Retrying...`);
      if (attempt === retries - 1) {
        throw lastError;
      }
    }
  }
  throw lastError;
}

// src/client/test/workerPoolObtain.test.ts
function mockAsyncSuccess(result, delay) {
  return new Promise((resolve) => setTimeout(() => resolve(result), delay));
}
function mockAsyncFailure(delay) {
  return new Promise(
    (_, reject) => setTimeout(() => reject(new Error("Failed operation")), delay)
  );
}
Deno.test("WorkerPool processes tasks in parallel", async () => {
  const workerPool = new WorkerPool(2);
  const task1 = workerPool.submitTask({ result: await Promise.resolve("task1"), delay: 100 });
  const task2 = workerPool.submitTask({ result: await Promise.resolve("task2"), delay: 50 });
  const [result1, result2] = await Promise.all([task1, task2]);
  if (result1 !== "task1" || result2 !== "task2") {
    throw new Error(`Expected "task1" and "task2" but got ${result1} and ${result2}`);
  }
});
Deno.test("WorkerPool queues tasks when workers are busy", async () => {
  const workerPool = new WorkerPool(1);
  const task1 = workerPool.submitTask({ result: await Promise.resolve("task1"), delay: 100 });
  const task2 = workerPool.submitTask({ result: await Promise.resolve("task2"), delay: 50 });
  const result1 = await task1;
  const result2 = await task2;
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
      () => mockAsyncSuccess("task2", 50)
    ];
    const result = await obtain(
      () => Promise.all(tasks.map((task) => task())),
      { batch: true, parallel: true }
    );
    if (result[0].length !== 2 || result[0][0] !== "task1" || result[0][1] !== "task2") {
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
    if (attempts !== 3) {
      throw new Error(`Expected 3 attempts but got ${attempts}`);
    }
  }
});
Deno.test("obtain function uses cache if available", async () => {
  const mockOperation = () => mockAsyncSuccess("cachedData", 50);
  const result1 = await obtain(mockOperation, { cache: true });
  const result2 = await obtain(mockOperation, { cache: true });
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
    if (error.message !== "Failed operation") {
      throw new Error(
        `Expected "Failed operation" but got "${error.message}"`
      );
    }
  }
});
//# sourceMappingURL=workerPoolObtain.test.js.map
