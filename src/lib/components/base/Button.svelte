<script lang="ts">
  export let type: string;
</script>

<button {type} class="btn" on:click>
  <slot />
</button>

<style lang="scss">
  .btn {
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
    @media (--breakpoint-not-small) {
      font-size: 1em;
      padding: 10px 14px;
    }

    &.minimal {
      border-color: transparent;
      background: none;
      &:hover {
        color: #fff;
        background: #387cec;
        border: 1px solid #387cec;
      }
    }
  }

  .btn:disabled {
    opacity: 0.5;
  }
</style>
