export function deepClone(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return primitives and null as is
    }
  
    // Handle arrays
    if (Array.isArray(obj)) {
      const newArr = [];
      for (let i = 0; i < obj.length; i++) {
        newArr[i] = deepClone(obj[i]); // Recursively clone array elements
      }
      return newArr;
    }
  
    // Handle objects
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = deepClone(obj[key]); // Recursively clone properties
      }
    }
    return newObj;
  }