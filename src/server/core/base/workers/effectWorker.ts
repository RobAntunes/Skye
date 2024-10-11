// src/effect_worker.ts

self.onmessage = async (e) => {
  const { effectFn } = e.data;

  try {
    // Reconstruct the function
    const fn = new Function(`return (${effectFn})()`)();

    const result = fn;
    if (result instanceof Promise) {
      await result;
    }

    self.postMessage('done');
  } catch (error) {
    self.postMessage({ error: (error as Error).message });
  }

  self.close();
};