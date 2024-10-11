// src/core/base/reactivity/Observable.ts

export class Observable<T> {
  private subscribers: Set<(data: T) => void> = new Set();

  // Subscribe to the observable
  subscribe(callback: (data: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Emit data to all subscribers
  emit(data: T): void {
    for (const callback of this.subscribers) {
      callback(data);
    }
  }

  // Apply a transformation (map) to the emitted data
  map<U>(fn: (data: T) => U): Observable<U> {
    const newObservable = new Observable<U>();
    this.subscribe(data => newObservable.emit(fn(data)));
    return newObservable;
  }

  // Filter emitted data
  filter(predicate: (data: T) => boolean): Observable<T> {
    const newObservable = new Observable<T>();
    this.subscribe(data => {
      if (predicate(data)) newObservable.emit(data);
    });
    return newObservable;
  }

  // Debounce emitted data
  debounce(duration: number): Observable<T> {
    const newObservable = new Observable<T>();
    let timeout: ReturnType<typeof setTimeout> | null = null;

    this.subscribe(data => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => newObservable.emit(data), duration);
    });

    return newObservable;
  }
}