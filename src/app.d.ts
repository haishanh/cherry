/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
  interface Locals {
    user?: {
      userId: number;
      id: number;
      feature: number;
    };
  }

  interface Error {
    message: string;
    stack?: string;
  }

  // interface Platform {}

  // interface Session {
  //   user?: { userId: number };
  // }

  // interface Stuff {}
}
