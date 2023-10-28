<script lang="ts">
  import { formatDistance } from 'date-fns';

  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/base/Button.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { JobStatus } from '$lib/type';
  import { request } from '$lib/utils/http.util';

  import type { PageData } from './$types';

  export let data: PageData;

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
      invalidate('jobSrv.all');
    });
  }
</script>

<div>
  <p>The exported file is a CSV. Example ouptut:</p>
  <pre class="pre">{sampleCsv}</pre>
  <div class="action">
    <Button on:click={startExport}>Export Now</Button>
  </div>
  {#if data.jobs && data.jobs.length > 0}
    <h3 class="mb-1">Previous Exports</h3>
    <small class="secondary-text">Only last 10 is listed here</small>
    <ul>
      {#each data.jobs as job (job.id)}
        {@const output = job.output ? JSON.parse(job.output) : undefined}
        {@const url = output ? `/api/downloads/${output.filename}` : undefined}
        {@const timeAgo = formatDistance(job.createdAt * 1000, now)}
        <li>
          {#if output}
            <p>
              Created {timeAgo} ago. The export includes {output.bookmarkCount} bookmarks, {output.tagCount} tags, {output.groupCount}
              groups.
            </p>
            <a href={url}>download</a>
          {:else if job.status === JobStatus.InProgress}
            <p>Created {timeAgo} ago. <span class="chip orange">{job.status}</span></p>
          {:else if job.status === JobStatus.Pending}
            <p>Created {timeAgo} ago. <span class="chip yellow">{job.status}</span></p>
          {/if}
        </li>
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
  .chip {
    padding: 4px 9px;
    border-radius: 100px;
  }
  .chip.orange {
    color: hsl(31 100% 48%);
    background-color: hsl(35.48deg 94.9% 61.57% / 30%);
  }
  .chip.yellow {
    @media (prefers-color-scheme: light) {
      color: hsl(55.76deg 78.17% 26.98%);
    }
    @media (prefers-color-scheme: dark) {
      color: hsl(55.76deg 78.01% 84.18%);
    }
    background-color: hsl(49.65deg 100% 50% / 81%);
  }
  .mb-1 {
    margin-bottom: 4px;
  }
  .secondary-text {
    color: var(--color-text4);
  }
</style>
