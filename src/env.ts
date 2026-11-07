import { defineEnvVars } from '@sveltejs/kit/env';

// An unset icon service uses the app's built-in favicon endpoint.
export const variables = defineEnvVars({
  PUBLIC_ICON_SERVICE: { public: true, schema: (input) => input ?? '' },
});
