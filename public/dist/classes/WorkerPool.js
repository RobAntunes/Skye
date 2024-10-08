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
export {
  WorkerPool
};
//# sourceMappingURL=WorkerPool.js.map
