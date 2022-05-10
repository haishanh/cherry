interface Window {
  ethereum?: any;
}

declare module '@hsjs/svelte-icons/feather/*' {
  import { SvelteComponentTyped } from 'svelte';
  type FeatherProps = { color?: string; size?: number };
  export default class FeatherComponent extends SvelteComponentTyped<FeatherProps> {}
}
