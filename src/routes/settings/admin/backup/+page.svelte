<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import ExternalLink from '$lib/components/base/ExternalLink.svelte';
  import { promiseToast } from '$lib/components/base/toast/store';
  import { request } from '$lib/utils/http.util';

  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();

  const requestBackup = () => request({ url: '/api/admin/backups', method: 'POST' });

  function startBackup() {
    promiseToast(requestBackup(), {
      loading: 'Backing up the database...',
      success: () => ({
        description: 'Backed up the database successfully',
        duration: 4000,
      }),
      error: () => ({
        description: 'Failed to backup the database.',
        duration: 5000,
      }),
    });
  }
</script>

<div>
  <p>
    Backup your database to a S3 bucket. All S3 compatible services should be supported, like <ExternalLink
      href="https://www.backblaze.com/cloud-storage">Backblaze B2</ExternalLink
    >, <ExternalLink href="https://developers.cloudflare.com/r2/">Cloudflare R2</ExternalLink>.
  </p>
  {#if !data.backupDbMeta.s3Bucket}
    <p>
      It looks like "Backup" is not enabled. Maybe some of the required configuration environment variables are not
      provided. Please consult the documentation.
    </p>
  {:else}
    <p>Database backup files will be archived and named like:</p>
    <pre class="pre">{data.backupDbMeta.s3KeyTemplate}</pre>
    <p>They will be uploaded to the bucket "{data.backupDbMeta.s3Bucket}".</p>
    <div class="action">
      <Button onclick={startBackup}>Backup Now</Button>
    </div>
  {/if}
</div>

<style lang="scss">
  .pre {
    padding: 16px;
    border: 1px solid var(--bo-default);
    border-radius: 8px;
    overflow-x: auto;
  }
  .action {
    margin: 20px 0;
  }
</style>
