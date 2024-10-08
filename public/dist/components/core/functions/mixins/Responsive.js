var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/client/components/core/functions/mixins/Responsive.ts
function Responsive(Base) {
  return class ResponsiveComponent extends Base {
    constructor() {
      super(...arguments);
      __publicField(this, "resizeObserver");
    }
    connectedCallback() {
      super.connectedCallback && super.connectedCallback();
      this.setupResponsiveness();
    }
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      this.cleanupResponsiveness();
    }
    setupResponsiveness() {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this);
      this.handleResize();
    }
    cleanupResponsiveness() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    }
    handleResize() {
      const width = this.clientWidth;
      const styles = [
        { max: 599, fontSize: "12px", padding: "4px" },
        { min: 600, max: 959, fontSize: "14px", padding: "8px" },
        { min: 960, max: 1279, fontSize: "16px", padding: "12px" },
        { min: 1280, max: 1919, fontSize: "18px", padding: "16px" },
        { min: 1920, fontSize: "20px", padding: "20px" }
      ];
      let appliedStyle = styles[0];
      for (const style of styles) {
        if ((style.min === void 0 || width >= style.min) && (style.max === void 0 || width <= style.max)) {
          appliedStyle = style;
          break;
        }
      }
      this.style.fontSize = appliedStyle.fontSize;
      this.style.padding = appliedStyle.padding;
    }
  };
}
export {
  Responsive
};
//# sourceMappingURL=Responsive.js.map
