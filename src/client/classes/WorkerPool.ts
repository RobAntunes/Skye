export class WorkerPool {
    constructor(
      private maxWorkers: number,
      private workers: { worker: Worker, idle: boolean }[] = [],
      private taskQueue: Array<() => void> = []
    ) {
      for (let i = 0; i < this.maxWorkers; i++) {
        // Dynamically create a worker from a Blob with worker code
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
  
    private handleWorkerMessage(workerIndex: number, event: MessageEvent) {
      const { result } = event.data;
      console.log(result);
      this.workers[workerIndex].idle = true;
      this.assignTask();
    }
  
    submitTask<T>(taskData: { result: T; delay?: number }): Promise<T> {
      return new Promise((resolve, reject) => {
        const assignToWorker = () => {
          for (const workerWrapper of this.workers) {
            if (workerWrapper.idle) {
              workerWrapper.idle = false;
  
              // Ensure we are sending only serializable data (resolved result)
              workerWrapper.worker.postMessage({ result: taskData.result, delay: taskData.delay });
  
              workerWrapper.worker.onmessage = (event: MessageEvent) => {
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
  
          // If no workers are idle, queue the task
          this.taskQueue.push(() => this.submitTask(taskData).then(resolve).catch(reject));
        };
  
        assignToWorker();
      });
    }
  
    private assignTask() {
      if (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (task) task();
      }
    }
  }