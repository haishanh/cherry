<script lang="ts">
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';

  import Button from '$lib/components/base/Button.svelte';
  import Tooltip from '$lib/components/base/popover/Tooltip.svelte';
  import BookmarkEditForm from '$lib/components/bookmark/BookmarkEditForm.svelte';
  import LeafSpinner from '$lib/components/feedback/LeafSpinner.svelte';
  import Spinner from '$lib/components/feedback/Spinner.svelte';

  let bookmark = {
    id: 31252,
    url: 'https://www.youtube.com/',
    title: 'test',
    desc: 'test',
    tagIds: [3714],
  };
</script>

<main>
  <section>
    <LeafSpinner size={150} />
  </section>
  <section>
    <BookmarkEditForm {bookmark} />
  </section>
  <section>
    <div style="background-color:#000;padding:15px;">
      <Button modifier={['icon', 'v0']}>
        <Trash size={14} /><span class="btn-label"><kbd>SHIFT</kbd> + <kbd>3</kbd></span>
      </Button>
    </div>
  </section>
  <section>
    <div style="background-color:#fff;padding:15px;">
      <Button modifier={['icon', 'v1']}>
        <Trash size={14} /><span class="btn-label"><kbd>SHIFT</kbd> + <kbd>3</kbd></span>
      </Button>
    </div>
  </section>
  <section>
    <Button modifier={['icon']}>
      <Trash size={14} /><span class="btn-label"><kbd>SHIFT</kbd> + <kbd>3</kbd></span>
    </Button>
    <Button modifier={['icon']}><Trash size={14} /></Button>
    <Button>hello</Button>
    <Button modifier={['minimal']}>minimal</Button>
    <Button modifier={['minimal', 'icon']}><Trash size={14} /></Button>
    <Button modifier={['minimal', 'circular']}><CloseIcon size={16} /></Button>
  </section>
  <section>
    <Button>
      <Trash size={18} slot="icon" />
      <span>Delete</span>
    </Button>
    <Button>
      <Spinner slot="icon" size={18} />
      <span>Delete</span>
    </Button>
    <Button disabled>
      <Spinner slot="icon" size={18} />
      <span>Delete</span>
    </Button>
  </section>
  <section>
    <Button modifier={['warn']}>hello</Button>
  </section>
  <section>
    <Tooltip>
      <Button slot="trigger">hello</Button>
      <div slot="content">hdllo</div>
    </Tooltip>
  </section>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;

    max-width: 600px;
    margin: 16px auto;
  }
</style>
