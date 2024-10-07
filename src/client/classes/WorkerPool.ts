class WorkerPool {
    private workers: Worker[];
    private taskQueue: any[];
    private maxWorkers: number;
  
    constructor(maxWorkers: number) {
      this.maxWorkers = maxWorkers;
      this.workers = [];
      this.taskQueue = [];
      
      for (let i = 0; i < maxWorkers; i++) {
        const worker = new Worker(new URL('./worker.js', import.meta.url).href, { type: "module" });
        worker.onmessage = this.handleWorkerMessage.bind(this);
        this.workers.push(worker);
      }
    }
  
    private handleWorkerMessage(event: MessageEvent) {
      const { taskId, result } = event.data;
      // Handle task completion logic here, such as resolving promises
    }
  
    submitTask(task: any) {
      // Push task to the queue and assign to workers
      this.taskQueue.push(task);
      this.assignTask();
    }
  
    private assignTask() {
      for (const worker of this.workers) {
        if (worker.idle && this.taskQueue.length > 0) {
          const task = this.taskQueue.shift();
          worker.postMessage(task);
        }
      }
    }
  }

  export function parallel(fn: () => void, options?: { maxWorkers?: number }) {
    const workerPool = new WorkerPool(options?.maxWorkers || 4);
  
    return () => {
      workerPool.submitTask(fn);
    };
  }