// src/components/UserProfile.ts

import { Base } from "../../server/core/components/Component.ts";
import { effects } from "../../server/core/base/reactivity/Effect.ts";
import { skye } from "../../server/templates/render.ts";

/**
 * Interface defining the structure of the UserProfile state.
 */
interface UserProfileState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
  message?: string;
}

/**
 * UserProfile component that fetches and displays user data.
 */
export class UserProfile extends Base<UserProfileState> {
  constructor() {
    super();
    // Initialize reactive state
    this.state = effects.reactive<UserProfileState>({
      user: null,
      loading: false,
      error: null,
    });

    // Bind the event handler
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
  }

  /**
   * HTML template with skye expressions.
   */
  protected override template: string = `
    <div>
      {{${skye`<template id="loading"><p>Loading user data...</p></template>`}}}
      {{${skye`<template id="error"><p style="color: red;">Error: {{error}}</p></template>`}}}
      {{${skye`<template id="user"><h1>Welcome, {{user.name}}!</h1><p>Email: {{user.email}}</p></template>`}}}
      {{${skye`<template id="no-data"><p>No user data available.</p></template>`}}}
    </div>
  `;

  /**
   * Dynamic JavaScript to handle conditional rendering.
   */
  protected override scripts: string = `
      const loadingTemplate = this.shadowRoot!.querySelector('#loading')!.innerHTML;
      const errorTemplate = this.shadowRoot!.querySelector('#error')!.innerHTML;
      const userTemplate = this.shadowRoot!.querySelector('#user')!.innerHTML;
      const noDataTemplate = this.shadowRoot!.querySelector('#no-data')!.innerHTML;
      
      const container = this.shadowRoot!.querySelector('div')!;
      
      // Clear existing content
      container.innerHTML = '';
      
      if (this.state.loading) {
        container.innerHTML += loadingTemplate;
      }
      
      if (this.state.error) {
        container.innerHTML += errorTemplate;
      }
      
      if (this.state.user) {
        container.innerHTML += userTemplate;
      }
    
      if (!this.state.user && !this.state.loading && !this.state.error) {
        container.innerHTML += noDataTemplate;
     `;

  /**
   * Lifecycle hook that runs when the component is mounted.
   */
  protected onMount(): void {
    // Subscribe to async operation completion
    effects.on("operationComplete", this.handleUserUpdate);

    // Initiate fetching user data
    this.fetchUserData();
  }

  /**
   * Lifecycle hook that runs when the component is unmounted.
   */
  protected onUnmount(): void {
    // Cleanup event listeners
    effects.off("operationComplete", this.handleUserUpdate);
  }

  /**
   * Handles updates when an asynchronous operation completes.
   * @param payload The payload emitted with the operationComplete event.
   */
  private handleUserUpdate(payload: any): void {
    const { asyncOperation, result } = payload;
    if (asyncOperation === fetchUserDataFromAPI) {
      this.state.user = result;
      this.state.loading = false;
      this.state.error = null;
      // No need to manually call render() due to automatic rendering
    }
  }

  /**
   * Fetches user data asynchronously using the Effects.obtain method.
   */
  private async fetchUserData(): Promise<void> {
    this.state.loading = true;

    try {
      await effects.obtain(fetchUserDataFromAPI, {
        cache: true, // Enable caching for this operation
        retries: 2, // Retry up to 2 times on failure
        onStart: () => {
          console.log("Fetching user data...");
        },
        onComplete: (_result: any) => {
          console.log("User data fetched successfully.");
          // State update is handled in handleUserUpdate
        },
        onError: (error: any) => {
          console.error("Error fetching user data:", error);
          this.state.error = error.message;
          this.state.loading = false;
          // No need to manually call render() due to automatic rendering
        },
      });
    } catch (error) {
      // Handle errors that weren't caught by obtain
      this.state.error = (error as Error).message;
      this.state.loading = false;
      // No need to manually call render() due to automatic rendering
    }
  }
}

customElements.define("user-profile", UserProfile);

/**
 * Simulates an asynchronous API call to fetch user data.
 * @returns A promise that resolves with user data.
 */
async function fetchUserDataFromAPI(): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate successful fetch
  return {
    id: "u123",
    name: "Alice Smith",
    email: "alice@example.com",
  };

  // To simulate an error, uncomment the following lines:
  /*
  throw new Error('Failed to fetch user data.');
  */
}

/**
 * Simulates sending analytics data.
 * @returns A promise that resolves after sending data.
 */
// async function sendAnalyticsData(): Promise<void> {
//   // Simulate network delay
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   console.log("Analytics data sent.");
// }
