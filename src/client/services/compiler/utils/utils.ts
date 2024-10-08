export function evalScript(script: string): any {
    const module = { exports: {} };
    const exports = module.exports;
    const scriptContent = `
      ${script}
      return module.exports;
    `;
    const func = new Function('module', 'exports', scriptContent);
    func(module, exports);
    return module.exports;
  }
  
  export function getComponentName(filePath: string): string {
    // Extract the file name without extension
    const fileName = filePath.split('/').pop()?.split('.').shift();
    return fileName ? fileName.toLowerCase() : 'my-component';
  }
  
  export function toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase());
  }