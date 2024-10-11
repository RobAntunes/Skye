// src/reactivity/batch.ts

/**
 * The BatchManager handles batching of effects, supporting nested batching.
 * It ensures that effects are executed only once after all batched mutations.
 */
class BatchManager {
  private batchingDepth: number = 0;
  private batchedEffects: Set<() => void> = new Set();

  /**
   * Executes a function within a batch context.
   * Effects scheduled during this function are batched and executed once after completion.
   * Supports nested batching.
   * @param fn The function containing multiple state mutations.
   */
  public batch(fn: () => void): void {
    this.batchingDepth++;
    try {
      fn();
    } catch (error) {
      console.error('Error during batch execution:', error);
    } finally {
      this.batchingDepth--;
      if (this.batchingDepth === 0) {
        this.runBatchedEffects();
      }
    }
  }

  /**
   * Schedules an effect to run, considering if batching is active.
   * If batching, the effect is added to the batchedEffects set.
   * Otherwise, the effect is executed immediately.
   * @param effect The effect function to schedule.
   */
  public scheduleEffect(effect: () => void): void {
    if (this.batchingDepth > 0) {
      this.batchedEffects.add(effect);
    } else {
      this.runEffectSafely(effect);
    }
  }

  /**
   * Runs all batched effects in a safe manner.
   * Ensures that each effect runs only once and handles errors gracefully.
   */
  private async runBatchedEffects(): Promise<void> {
    const effectsToRun = Array.from(this.batchedEffects);
    this.batchedEffects.clear();
    for (const effect of effectsToRun) {
      await this.runEffectSafely(effect);
    }
  }

  /**
   * Executes an effect function safely, catching and logging any errors.
   * @param effect The effect function to execute.
   */
  private async runEffectSafely(effect: () => void): Promise<void> {
    try {
      await effect();
    } catch (error) {
      console.error('Error during effect execution:', error);
    }
  }
}

/**
 * Instantiate a single BatchManager
 */
const batchManager = new BatchManager();

/**
 * Batches multiple state mutations, ensuring effects run only once after all updates.
 * @param fn A function containing multiple state mutations.
 */
export function batch(fn: () => void): void {
  batchManager.batch(fn);
}

/**
 * Schedules an effect to run, considering if batching is active.
 * @param effect The effect function to schedule.
 */
export function scheduleBatchedEffect(effect: () => void): void {
  batchManager.scheduleEffect(effect);
}