export class EventEmitter<T extends Record<string, any>> {
  private events = new Map<keyof T, Set<(data: any) => void>>();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}