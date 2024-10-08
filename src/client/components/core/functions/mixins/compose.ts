// src/mixins/composeMixins.ts

export function composeMixins<T extends new (...args: any[]) => any>(
    Base: T,
    ...mixins: ((Base: T) => T)[]
  ): T {
    return mixins.reduce((accumulator, mixin) => mixin(accumulator), Base);
  }