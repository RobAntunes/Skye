// services/sfcCompiler.ts

import { generatePropertyBindingSetupCode } from "./bindGenerator.ts";
import { generateEventListenerSetupCode } from "./eventGenerator.ts";
import { parseTemplate } from "./parser.ts";
// @ts-expect-error - used in template
import { reactive, effect } from "../reactive.ts";
// @ts-expect-error - used in template
import { skye } from "./render.ts";
import { evalScript, getComponentName, toPascalCase } from "./utils/utils.ts";

export async function compileSFC(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);

  // Extract sections
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);

  const template = templateMatch ? templateMatch[1].trim() : "";
  const script = scriptMatch ? scriptMatch[1].trim() : "";
  const style = styleMatch ? styleMatch[1].trim() : "";

  // Evaluate the script section to get the component definition
  const componentDef = evalScript(script);

  // Parse the template to handle event bindings and bindings
  const { processedTemplate, eventBindings, propertyBindings } = parseTemplate(template);

  // Generate the component class
  const componentName = getComponentName(filePath);
  const className = toPascalCase(componentName);

  const componentClassCode = `
    class ${className} extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        const component = (${componentDef.setup.toString()}).call(this);
        this.state = component.state || reactive({});
        this.methods = component.methods || {};
        Object.assign(this, this.methods);

        this.render();

        // Set up effects
        effect({
          update: () => {
            this.update();
          },
        });
      }

      connectedCallback() {
        this.setupEventListeners();
        this.setupPropertyBindings();
      }

      setupEventListeners() {
        ${generateEventListenerSetupCode(eventBindings)}
      }

      setupPropertyBindings() {
        ${generatePropertyBindingSetupCode(propertyBindings)}
      }

      render() {
        const templateContent = \`${processedTemplate}\`;
        const rendered = skye\`\${templateContent}\`;
        this.shadowRoot.innerHTML = \`
          <style>${style}</style>
          \${rendered}
        \`;
      }

      update() {
        this.render();
        this.setupEventListeners();
        this.setupPropertyBindings();
      }
    }

    customElements.define("${componentName}", ${className});
  `;

  // Evaluate the component class code
  eval(componentClassCode);
}