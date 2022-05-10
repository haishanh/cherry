<script lang="ts">
  export let type: string | null = null;
  export let kind = '';
  // native tooltip
  export let title: string | null = null;
</script>

<button {type} {title} class={kind} on:click>
  <slot />
</button>

<style lang="scss">
  button {
    -webkit-appearance: none;
    outline: none;
    user-select: none;
    position: relative;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    background: var(--bg-btn);
    border: 1px solid var(--color-btn-bo);
    border-radius: 100px;
    &:focus {
      border-color: #387cec;
    }
    &:hover {
      background: #387cec;
      border: 1px solid #387cec;
      color: #fff;
    }
    &:active {
      transform: scale(0.97);
    }

    padding: 9px 13px;

    &.minimal {
      border-color: transparent;
      background: none;

      &:hover {
        color: #fff;
        background: #387cec;
        border: 1px solid #387cec;
      }
    }
    &.icon {
      padding: 7px;
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
      border-color: hsl(0deg 0% var(--lightness));
      background: none;
      &:hover {
        @media (prefers-color-scheme: dark) {
          --lightness: 70%;
        }
        @media (prefers-color-scheme: light) {
          --lightness: 15%;
        }
        border-color: hsl(0deg 0% var(--lightness));
        background: var(--bg-btn);
      }
    }
  }

  button:disabled {
    opacity: 0.5;
  }
</style>
