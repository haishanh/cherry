<script>
  import { Inbox } from '@lucide/svelte';
  import Dropzone from '$lib/components/file-dropzone/Dropzone.svelte';

  let files = $state({ accepted: [], rejected: [] });

  async function handleFilesSelect(e) {
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

<main>
  <Dropzone
    containerClasses="dzone {dragenter ? 'dragenter' : ''}"
    multiple={false}
    accept={['text/html']}
    disableDefaultStyles
    ondrop={handleFilesSelect}
    ondragenter={handleDragenter}
    ondragleave={handleDragleave}
    onfiledropped={handleDragleave}
  >
    <div class="inbox-icon">
      <Inbox />
    </div>
    <p>Click or drag your file here</p>
    {#if files.accepted[0]}
      <p class="note">{files.accepted[0].name}</p>
    {:else if files.rejected[0]}
      {@const err = files.rejected[0].errors?.[0]?.message ?? 'Invalid file'}
      <p class="note rejected-file">{err}</p>
    {/if}
  </Dropzone>
</main>

<style lang="scss">
  :global(.dzone) {
    background-color: var(--bg-card);
    border: 1px dashed #ccc;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    border-radius: 1000px;
    cursor: pointer;
    text-align: center;
    padding-bottom: 13px;
    p {
      margin: 0;
    }
  }
  :global(.dragenter) {
    // border-color: var(--accent);
    color: var(--accent);
    background-color: hsla(94deg, 99%, 33%, 0.2);
  }
  .inbox-icon {
    height: 50px;
    display: grid;
    place-items: center;
  }
  .note {
    margin: 8px 0;
  }
  .rejected-file {
    color: hsl(0deg 84% 61%);
  }

  main {
    max-width: 500px;
    margin: 0 auto;
  }
</style>
