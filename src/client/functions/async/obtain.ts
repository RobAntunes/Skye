import { WorkerPool } from "../../classes/WorkerPool.ts";

type ObtainOptions = {
  cache?: boolean; // Use cached data if available
  paginate?: boolean; // Handle pagination if required
  maxCacheAge?: number; // Time in milliseconds before cache is invalidated
  retries?: number; // Number of retries if an operation fails
  parallel?: boolean; // Run the operation in parallel using a worker pool
  maxWorkers?: number; // Maximum number of workers for parallel processing
  batch?: boolean; // Batch async operations if needed
};

export function obtain<T>(
  asyncOperation: () => Promise<T>, // Each async operation returns a promise
  options: ObtainOptions = {}
): Promise<T[]> {
  const {
    cache = true,
    paginate = false,
    maxCacheAge = 60000,
    retries = 3,
    parallel = false,
    maxWorkers = 4,
    batch = false,
  } = options;

  let cacheData: { result: Promise<T[]>; timestamp: number } | null = null;

  return new Promise((resolve, reject) => {
    try {
      if (cache && cacheData) {
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < maxCacheAge) {
          resolve(cacheData.result);
          return;
        }
      }

      let result: Promise<T[]>;

      if (parallel) {
        const workerPool = new WorkerPool(maxWorkers);
        result = new Promise((resolve, reject) => {
          if (batch) {
            const taskPromises = [asyncOperation, asyncOperation].map(async (task) => {
              const resolvedResult = await task();
              return workerPool.submitTask({ result: resolvedResult, delay: 100 });
            });

            Promise.all(taskPromises)
              .then((resolvedTasks) => resolve(resolvedTasks as T[]))
              .catch(reject);
          } else {
            asyncOperation().then(resolvedResult => {
              workerPool.submitTask({ result: resolvedResult, delay: 100 })
                .then((result) => resolve([result])) // Unwrap the resolved result
                .catch(reject);
            });
          }
        });
      } else {
        // Non-parallel execution with retry logic
        result = batch
          ? Promise.all([retryOperation(asyncOperation, retries)]).then((res) => res as T[])
          : retryOperation(asyncOperation, retries).then((result) => [result]);
      }

      if (cache) {
        cacheData = { result, timestamp: Date.now() };
      }

      if (paginate) {
        // Handle pagination logic here if needed
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
      // Attempt the operation
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed. Retrying...`);

      // If all retries are exhausted, throw the last encountered error
      if (attempt === retries - 1) {
        throw lastError;
      }
    }
  }
  throw lastError; // In case the loop completes without a successful operation
}
