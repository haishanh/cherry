<script lang="ts">
  import { CircleArrowUp, Inbox } from '@lucide/svelte';
  // import Dropzone from 'svelte-file-dropzone';
  import Dropzone from '$lib/components/file-dropzone/Dropzone.svelte';

  import Button from '$lib/components/base/Button.svelte';
  import Spinner from '$lib/components/feedback/Spinner.svelte';

  import type { DropzoneFiles } from './import.shared';

  type Props = {
    startImport: (files: DropzoneFiles) => unknown;
    loading: boolean;
    accept: string | string[];
  };

  let { startImport, loading, accept }: Props = $props();

  const filesInitial: DropzoneFiles = { accepted: [], rejected: [] };
  let files = $state(filesInitial);

  function handleClickImport() {
    startImport(files);
  }

  async function handleFilesSelect(e: any) {
    const { acceptedFiles, fileRejections } = e;

    files.accepted = [...acceptedFiles];
    files.rejected = [...fileRejections];
  }

  let dragenter = $state(false);

  function handleDragenter() {
    dragenter = true;
  }

  function handleDragleave() {
    dragenter = false;
  }
</script>

<div class="wrap">
  <Dropzone
    containerClasses="dzone {dragenter ? 'dragenter' : ''}"
    multiple={false}
    {accept}
    disableDefaultStyles
    ondrop={handleFilesSelect}
    ondragenter={handleDragenter}
    ondragleave={handleDragleave}
    onfiledropped={handleDragleave}
  >
    <div class="inbox-icon"><Inbox /></div>
    <p>Click or drag your file here</p>
    {#if files.accepted[0]}
      <p class="note">File: {files.accepted[0].name}</p>
      <p>Click button below to import</p>
    {:else if files.rejected[0]}
      {@const err = files.rejected[0].errors?.[0]?.message ?? 'Invalid file'}
      <p class="note rejected-file">Error: {err}</p>
    {/if}
  </Dropzone>
  <div class="action">
    {#snippet icon()}
      {#if loading}
        <Spinner size={18} />
      {:else}
        <CircleArrowUp size={18} />
      {/if}
    {/snippet}

    <Button disabled={loading || !files.accepted[0]} onclick={handleClickImport} {icon}>
      <span>Import</span>
    </Button>
  </div>
</div>

<style lang="scss">
  :global(.dzone) {
    background-color: var(--bg-card);
    border: 1px dashed var(--bo);
    border-radius: 15px;
    cursor: pointer;
    text-align: center;
    padding-bottom: 20px;
    p {
      margin: 0;
    }
    .note {
      margin: 8px 0;
    }
    @media (prefers-color-scheme: dark) {
      --bo: hsl(0deg 0% 22%);
    }
    @media (prefers-color-scheme: light) {
      --bo: hsl(0deg 0% 86%);
    }
  }
  :global(.dragenter) {
    color: var(--accent);
    background-color: hsla(94deg, 99%, 33%, 0.2);
  }
  .inbox-icon {
    height: 50px;
    display: grid;
    place-items: center;
  }
  .rejected-file {
    color: hsl(0deg 84% 61%);
  }
  .wrap {
    max-width: 450px;
    text-align: center;
    .action {
      margin-top: 10px;
    }
  }
</style>
