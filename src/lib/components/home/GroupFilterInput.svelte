<script lang="ts">
  import { Funnel } from '@lucide/svelte';

  type Props = {
    value?: string;
  };

  let { value = $bindable('') }: Props = $props();
</script>

<div class="root">
  <div class="input-wrap">
    <input placeholder="Search" bind:value />
    <span class="icon-wrap">
      <Funnel size={16} />
    </span>
  </div>
</div>

<style lang="scss">
  .root {
    max-width: 80%;
    margin: 0 auto;
    --shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
  }
  .input-wrap {
    display: flex;
    align-items: center;
    padding: 3px 5px;
    border-radius: 100px;
    border: 1px solid var(--color-input-bo);
    &:focus-within {
      box-shadow: var(--shadow);
    }
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    input {
      width: 100%;
      height: 30px;
      font-size: inherit;
      font-family: inherit;
      padding: 5px;
      outline: none;
      background: none;
      border: none;
    }
    .icon-wrap {
      --sz: 28px;
      color: var(--color-input-bo);
      width: var(--sz);
      height: var(--sz);
      display: flex;
      align-items: center;
      justify-content: center;
      // position: absolute;
      // right: 0;
      // top: 50%;
      // transform: translateY(-50%);
    }
  }
</style>
