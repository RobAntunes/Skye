import type { EventBinding, PropertyBinding } from "../../types.ts";

export function parseTemplate(template: string): {
    processedTemplate: string;
    eventBindings: EventBinding[];
    propertyBindings: PropertyBinding[];
  } {
    interface EventBinding {
      elementId: string;
      eventType: string;
      handlerExpression: string;
    }
  
    interface PropertyBinding {
      elementId: string;
      property: string;
      stateProperty: string;
    }
  
    const eventBindings: EventBinding[] = [];
    const propertyBindings: PropertyBinding[] = [];
    let processedTemplate = template;
    let elementCounter = 0;
  
    // Regex to match elements and extract attributes
    const elementRegex = /<([a-zA-Z0-9\-]+)([^>]*)>/g;
    processedTemplate = processedTemplate.replace(elementRegex, (_match, tagName, attributes) => {
      let newAttributes = attributes;
      let hasEvent = false;
      let hasBinding = false;
      const elementId = `skye-${elementCounter++}`;
  
      // Regex to find event attributes like onclick={...}
      const eventAttrRegex = /(\s+on\w+)=(\{[\s\S]*?\})/g;
      newAttributes = newAttributes.replace(eventAttrRegex, (_attrMatch: any, eventAttrName: any, eventAttrValue: any) => {
        hasEvent = true;
        const eventType = eventAttrName.trim().substring(2); // Remove 'on' prefix
        const handlerExpression = eventAttrValue.trim().slice(1, -1); // Remove '{' and '}'
  
        // Add to event bindings
        eventBindings.push({
          elementId,
          eventType,
          handlerExpression,
        });
  
        // Remove the event attribute from the element
        return '';
      });
  
      // Regex to find bindings like bind:value={stateProperty}
      const bindAttrRegex = /(\s+bind:([\w]+))=(\{[\s\S]*?\})/g;
      newAttributes = newAttributes.replace(bindAttrRegex, (_attrMatch: any, _fullMatch: any, property: any, value: any) => {
        hasBinding = true;
        const stateProperty = value.trim().slice(1, -1); // Remove '{' and '}'
  
        // Add to property bindings
        propertyBindings.push({
          elementId,
          property,
          stateProperty,
        });
  
        // Remove the bind attribute from the element
        return '';
      });
  
      // If the element has events or bindings, add an id attribute
      if (hasEvent || hasBinding) {
        newAttributes += ` id="${elementId}"`;
      }
  
      return `<${tagName}${newAttributes}>`;
    });
  
    return { processedTemplate, eventBindings, propertyBindings };
  }