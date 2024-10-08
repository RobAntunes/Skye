// src/client/components/core/functions/mixins/compose.ts
function composeMixins(Base, ...mixins) {
  return mixins.reduce((accumulator, mixin) => mixin(accumulator), Base);
}
export {
  composeMixins
};
//# sourceMappingURL=compose.js.map
