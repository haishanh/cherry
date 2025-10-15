<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import Modal from '$lib/components/base/Modal.svelte';

  let modal: Modal;
  function open() {
    modal.open();
  }
  function close() {
    modal.close();
  }
  function toggle() {
    if (modal.getState().isOpen) {
      close();
    } else {
      open();
    }
  }
</script>

<main>
  <Button onclick={toggle}>open</Button>

  <Modal bind:this={modal}>
    <h1>hello</h1>
  </Modal>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }
</style>
