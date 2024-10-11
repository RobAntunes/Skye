// src/middleware/index.ts

type MiddlewareFunction = (
  prop: string | symbol,
  value: any,
  oldValue: any
) => any | Promise<any>;

interface IMiddleware {
  fn: MiddlewareFunction;
  condition?: (prop: string | symbol, value: any, oldValue: any) => boolean | Promise<boolean>;
}

export class Middleware {
  private middlewares: IMiddleware[] = [];

  /**
   * Registers a new middleware.
   * @param fn The middleware function.
   * @param condition An optional condition function to determine if the middleware should be applied.
   */
  public use(
    fn: MiddlewareFunction,
    condition?: (prop: string | symbol, value: any, oldValue: any) => boolean | Promise<boolean>
  ): void {
    this.middlewares.push({ fn, condition });
  }

  /**
   * Executes all applicable middleware functions in sequence.
   * @param prop The property being mutated.
   * @param value The new value of the property.
   * @param oldValue The old value of the property.
   * @returns The final transformed value after all middleware have been applied.
   */
  public async execute(prop: string | symbol, value: any, oldValue: any): Promise<any> {
    let transformedValue = value;
    for (const middleware of this.middlewares) {
      const { fn, condition } = middleware;
      let shouldApply = true;
      if (condition) {
        try {
          shouldApply = await condition(prop, transformedValue, oldValue);
        } catch (error) {
          console.error('Error evaluating middleware condition:', error);
          shouldApply = false;
        }
      }
      if (shouldApply) {
        try {
          transformedValue = await fn(prop, transformedValue, oldValue);
        } catch (error) {
          console.error('Error executing middleware:', error);
        }
      }
    }
    return transformedValue;
  }

  /**
   * Clears all registered middleware.
   */
  public clear(): void {
    this.middlewares = [];
  }
}