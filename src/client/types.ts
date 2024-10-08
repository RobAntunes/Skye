export interface EventBinding {
    elementId: string;
    eventType: string;
    handlerExpression: string;
  }
  
  export interface PropertyBinding {
    elementId: string;
    property: string;
    stateProperty: string;
  }