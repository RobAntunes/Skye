export type Listener<Args extends any[]> = (...args: Args) => void;
export type EventMap = Record<string, any[]>;

export class EventCore<Events extends EventMap> {
  private events = new Map<keyof Events, Set<Listener<any>>>();

  /**
   * Subscribe to an event.
   * @param event - The event name.
   * @param listener - The callback function to run when the event is emitted.
   */
  public on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    const listeners = this.events.get(event) as Set<Listener<Events[K]>>;
    listeners.add(listener);
  }

  /**
   * Emit an event and trigger all listeners associated with it.
   * @param event - The event name.
   * @param args - The arguments to pass to the listener callbacks.
   */
  public emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    const listeners = this.events.get(event) as Set<Listener<Events[K]>> | undefined;
    if (listeners) {
      listeners.forEach((listener) => {
        listener(...args);
      });
    }
  }

  /**
   * Unsubscribe from an event.
   * @param event - The event name.
   * @param listener - The callback to remove.
   */
  public off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const listeners = this.events.get(event) as Set<Listener<Events[K]>> | undefined;
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Subscribe to an event to be triggered once.
   * @param event - The event name.
   * @param listener - The callback function to trigger.
   */
  public once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const onceListener: Listener<Events[K]> = (...args) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
}