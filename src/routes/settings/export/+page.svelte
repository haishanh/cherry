<script lang="ts">
  import { formatDistance } from 'date-fns';

  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/base/Button.svelte';
  import Chip from '$lib/components/base/Chip.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { JobStatus } from '$lib/type';
  import { request } from '$lib/utils/http.util';

  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();

  const now = new Date();

  const sampleCsv = [
    'created,group,tags,url,title,description',
    '1698066273,work,"linux,network",https://example.com/a/b,some title,some description',
  ].join('\n');

  async function startExport() {
    return await request({
      url: '/api/jobs',
      method: 'POST',
      data: { op: 'export', input: {} },
    }).then(() => {
      addToast({
        status: 'success',
        description: 'Export job started',
      });
      invalidate((url) => url.pathname === '/api/jobs');
    });
  }
</script>

<div>
  <p>The exported file is a CSV. Example ouptut:</p>
  <pre class="pre">{sampleCsv}</pre>
  <div class="action">
    <Button onclick={startExport}>Export Now</Button>
  </div>
  {#if data.jobs && data.jobs.length > 0}
    <h3 class="mb-1">Previous Exports</h3>
    <small class="secondary-text">Only last 10 is listed here</small>
    <ul>
      {#each data.jobs as job (job.id)}
        {@const timeAgo = formatDistance(job.createdAt * 1000, now)}
        {#if job.output}
          {@const output = job.output ? JSON.parse(job.output) : undefined}
          {@const url = output ? `/api/downloads/${output.filename}` : undefined}
          <li>
            <p>
              Created {timeAgo} ago. The export includes {output.bookmarkCount} bookmarks, {output.tagCount} tags, {output.groupCount}
              groups.
            </p>
            <a href={url}>download</a>
          </li>
        {:else if job.error}
          <li>
            <p>Created {timeAgo} ago. <Chip modifier="error">Failed</Chip></p>
            <pre class="pre">{job.error}</pre>
          </li>
        {:else if job.status === JobStatus.InProgress}
          <li>
            <p>Created {timeAgo} ago. <Chip modifier="info">{job.status}</Chip></p>
          </li>
        {:else if job.status === JobStatus.Pending}
          <li>
            <p>Created {timeAgo} ago. <Chip modifier="warning">{job.status}</Chip></p>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
  <!-- <pre>{JSON.stringify(data.jobs, null, 2)}</pre> -->
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
  ul {
    padding-inline-start: 16px;
  }
  a {
    color: var(--accent);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .mb-1 {
    margin-bottom: 4px;
  }
  .secondary-text {
    color: var(--color-text4);
  }
</style>
