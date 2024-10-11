// src/core/WorkerPool.ts

import { EventEmitter } from "../reactivity/EventEmitter.ts";

interface WorkerPoolEvents {
  "worker:done": { worker: Worker; result: unknown };
  "worker:error": { worker: Worker; error: Error };
}

interface Task {
  effectFn: string;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  retries: number;
}

export class WorkerPool extends EventEmitter<{[key in keyof WorkerPoolEvents]: any}> {
  private pool: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private maxWorkers: number;
  private workerScript: string;
  private maxRetries: number;
  private retryDelay: number; // in ms

  constructor(
    workerScript: string,
    maxWorkers: number = 4,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ) {
    super();
    this.workerScript = workerScript;
    this.maxWorkers = maxWorkers;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Runs an effect function in the worker pool.
   * @param {string} effectFn - The effect function as a string.
   * @returns {Promise<any>} A promise that resolves when the effect is done.
   */
  public runEffect(effectFn: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ effectFn, resolve, reject, retries: 0 });
      this.dispatch();
    });
  }

  /**
   * Dispatches tasks to idle workers.
   */
  private dispatch() {
    while (this.idleWorkers.length > 0 && this.taskQueue.length > 0) {
      const worker = this.idleWorkers.pop()!;
      const task = this.taskQueue.shift()!;
      this.executeTask(worker, task);
    }

    // Create new workers if pool is not full and tasks are pending
    while (
      this.idleWorkers.length + this.pool.length < this.maxWorkers &&
      this.taskQueue.length > 0
    ) {
      const worker = this.createWorker();
      this.pool.push(worker);
      this.idleWorkers.push(worker);
      this.dispatch();
    }
  }

  /**
   * Creates a new worker and sets up event listeners.
   * @returns {Worker} The created worker.
   */
  private createWorker(): Worker {
    const worker = new Worker(this.workerScript, { type: "module" });
    return worker;
  }

  /**
   * Executes a task using the provided worker.
   * @param {Worker} worker - The worker to execute the task.
   * @param {Task} task - The task to execute.
   */
  private executeTask(worker: Worker, task: Task): void {
    worker.postMessage({ effectFn: task.effectFn });

    const onMessage = (e: MessageEvent) => {
      if (e.data === "done") {
        task.resolve(e.data);
        this.emit("worker:done", { worker, result: e.data });
        this.cleanup(worker, onMessage, onError);
        this.idleWorkers.push(worker);
        this.dispatch();
      } else if (e.data.error) {
        if (task.retries < this.maxRetries) {
          task.retries += 1;
          console.warn(
            `Worker task failed. Retrying attempt ${task.retries}...`
          );
          setTimeout(() => {
            this.executeTask(worker, task);
          }, this.retryDelay);
        } else {
          task.reject(e.data.error);
          this.emit("worker:error", { worker, error: e.data.error });
          this.cleanup(worker, onMessage, onError);
          this.idleWorkers.push(worker);
          this.dispatch();
        }
      }
    };

    const onError = (error: ErrorEvent) => {
      if (task.retries < this.maxRetries) {
        task.retries += 1;
        console.warn(
          `Worker encountered an error. Retrying task... (Attempt ${task.retries})`
        );
        setTimeout(() => {
          this.executeTask(worker, task);
        }, this.retryDelay);
      } else {
        task.reject(error.message);
        this.emit("worker:error", { worker, error: error.message });
        this.cleanup(worker, onMessage, onError);
        this.idleWorkers.push(worker);
        this.dispatch();
      }
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
  }

  /**
   * Cleans up event listeners from a worker.
   * @param {Worker} worker - The worker instance.
   * @param {Function} onMessage - The message handler to remove.
   * @param {Function} onError - The error handler to remove.
   */
  private cleanup(
    worker: Worker,
    onMessage: (e: MessageEvent) => void,
    onError: (error: ErrorEvent) => void
  ): void {
    worker.removeEventListener("message", onMessage);
    worker.removeEventListener("error", onError);
  }

  /**
   * Shuts down all workers in the pool.
   */
  public shutdown(): void {
    this.pool.forEach((worker) => worker.terminate());
    this.pool = [];
    this.idleWorkers = [];
    this.taskQueue = [];
  }
}
