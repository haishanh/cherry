/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
  interface Locals {
    user?: any;
  }

  // interface Platform {}

  interface Session {
    user?: any;
  }

  // interface Stuff {}
}
