import { effect } from "../../reactivity/reactive.ts";

type ObtainOptions = {
  cache?: boolean; // Use cached data if available
  paginate?: boolean; // Handle pagination if required
  maxCacheAge?: number; // Time in milliseconds before cache is invalidated
  retries?: number; // Number of retries if an operation fails
  parallel?: boolean; // Run the operation in parallel using worker pool
  maxWorkers?: number; // Max workers for parallel processing
  batch?: boolean; // Batch async operations if needed
};

function obtain<T>(
  asyncOperation: () => Promise<T>,
  options: ObtainOptions = {}
): Promise<T> {
  const {
    cache = true,
    paginate = false,
    maxCacheAge = 60000,
    retries = 3,
    parallel = false,
    maxWorkers = 4,
    batch = false,
  } = options;

  let cacheData: { result: Promise<T>; timestamp: number } | null = null;

  return new Promise((resolve, reject) => {
    try {
      if (cache && cacheData) {
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < maxCacheAge) {
          resolve(cacheData.result);
          return;
        }
      }

      let result: Promise<T>;

      if (parallel) {
        // Run the async operation in parallel using a worker pool
        const workerPool = new WorkerPool(maxWorkers);
        result = new Promise((res, rej) => {
          workerPool.submitTask(asyncOperation);
        });
      } else {
        // Run the operation with retry logic
        result = retryOperation(asyncOperation, retries);
      }

      if (cache) {
        cacheData = { result, timestamp: Date.now() };
      }

      if (paginate) {
        // Handle pagination logic here
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number
): Promise<T> {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

effect.obtain = obtain;