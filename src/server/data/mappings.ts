import { SkyeServer } from "../classes/SkyeServer.ts";

interface DataFetcher {
    (params: Record<string, any>): Promise<Record<string, any>>;
  }
  
  interface RouteConfig {
    template: (context: Record<string, any>) => string;
    fetchData: DataFetcher;
  }
  
  // TODO: find way to enforce this more
  export const routes: Record<string, RouteConfig> = {
    "/welcome": {
      template: await import("../routes/welcome.ts").then((module) => module.default(new SkyeServer())) as (context: Record<string, any>) => string,
      fetchData: async (_params: Record<string, any> = {}) => {
        // Fetch data based on params
        return {
          title: "Welcome to Skye Framework",
          user: { isLoggedIn: true, name: "Alice" },
          items: ["Item 1", "Item 2", "Item 3"],
        };
      },
    },
    // ... other routes
  };