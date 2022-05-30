declare module '@hsjs/svelte-icons/feather/*' {
  import { SvelteComponentTyped } from 'svelte';
  type FeatherProps = { color?: string; size?: number };
  export default class FeatherComponent extends SvelteComponentTyped<FeatherProps> {}
}

declare module 'svelte-file-dropzone' {
  import { SvelteComponentTyped } from 'svelte';
  type FileDropzoneProps = {
    containerClasses?: string;
    multiple?: boolean;
    accept?: string | string[];
    disableDefaultStyles?: boolean;
  };
  export default class FeatherComponent extends SvelteComponentTyped<FileDropzoneProps> {}
}

declare const __VERSION__: string;
