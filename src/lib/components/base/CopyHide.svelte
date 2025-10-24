<script lang="ts">
  let { cnt }: { cnt: string } = $props();

  import CopyButton from '$lib/components/base/misc/CopyButton.svelte';

  import EyeButton from './misc/EyeButton.svelte';

  let show = $state(false);
  let hiddenText = asteriskify(cnt);

  // we want the asteriskified text the same length to avoid layout shift
  function asteriskify(input: string) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      result += '*';
    }
    return result;
  }

  const handleClickEyeButton = () => {
    show = !show;
  };

  function provide() {
    return cnt;
  }
</script>

<div class="wrap">
  <div class="cnt"><pre class="pre" class:show>{show ? cnt : hiddenText}</pre></div>
  <div class="btn-group">
    <EyeButton bind:show onclick={handleClickEyeButton} />
    <CopyButton {provide} />
  </div>
</div>

<style lang="scss">
  .wrap {
    position: relative;
    display: flex;
    width: 100%;
    border: 1px solid var(--bo-default);
    padding: 5px;
    border-radius: 5px;
  }
  .cnt {
    flex: 1;
    min-width: 0;
  }
  .pre {
    padding: 10px 5px;
    margin: 0;
    min-width: 10px;
    border: 1px solid var(--color-pre-bo);
    border-radius: 5px;
    font-family: var(--fmono);
    line-height: 1.2;
    font-size: 0.8em;
    white-space: normal;
    word-break: break-word;
  }
  .pre.show {
    word-break: break-all;
  }
  .btn-group {
    display: flex;
    gap: 5px;
  }
</style>
