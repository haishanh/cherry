<script lang="ts">
  import type { Snippet } from 'svelte';

  import { fetchGroups } from '#lib/client/group.store.js';
  import { fetchTags } from '#lib/client/tag.store.js';
  import Button from '#lib/components/base/Button.svelte';
  import FieldSelect from '#lib/components/base/FieldSelect.svelte';
  import { addToast } from '#lib/components/base/toast/store.js';
  import { IMPORT_MAX_ROWS, type ImportDuplicates, type ImportResult } from '#lib/import.js';
  import { request, RequestError } from '#lib/utils/http.util.js';

  import FileDropZone from './FileDropZone.svelte';
  import type { DropzoneFiles } from './import.shared';

  type ImportSource = 'chrome' | 'firefox' | 'safari' | 'pocket' | 'csv';
  type Props = {
    accept: string | string[];
    source: ImportSource;
    children?: Snippet;
  };
  let { accept, source, children }: Props = $props();
  const duplicateOptions = [
    { value: 'skip', name: 'Skip duplicates' },
    { value: 'merge-tags', name: 'Merge tags only' },
  ] satisfies { value: ImportDuplicates; name: string }[];
  let loading = $state(false);
  let duplicates = $state<ImportDuplicates>('skip');
  let error = $state('');
  let preview = $state.raw<{ file: File; source: ImportSource; result: ImportResult } | null>(null);
  let completed = $state.raw<ImportResult | null>(null);
  const currentPreview = $derived(preview?.source === source ? preview : null);
  const summary = $derived(currentPreview?.result ?? completed);

  function resetPreview() {
    preview = null;
    completed = null;
    error = '';
  }

  function requestImport(file: File, format: ImportSource, isPreview: boolean): Promise<{ data: ImportResult }> {
    const endpoint =
      format === 'pocket' ? '/api/import' : `/api/import/${format === 'csv' ? 'csv' : 'netscape-bookmark-file-1'}`;
    const query = new URLSearchParams({ preview: isPreview ? '1' : '0', duplicates });
    return request({ url: `${endpoint}?${query}`, method: 'POST', data: file });
  }

  function showError(e: unknown) {
    if (e instanceof RequestError && typeof e.body?.message === 'string') {
      error = e.body.message;
    } else if (e instanceof RequestError && e.response?.status === 413) {
      error = 'The upload was rejected as too large. Use a smaller file (maximum 10 MiB).';
    } else {
      error = 'Import request failed. Check your connection and preview again before retrying.';
    }
  }

  async function startImport(files: DropzoneFiles) {
    const file = files.accepted[0];
    if (!file || loading) return;
    resetPreview();
    loading = true;
    const format = source;
    try {
      const ret = await requestImport(file, format, true);
      preview = { file, source: format, result: ret.data };
    } catch (e) {
      showError(e);
    } finally {
      loading = false;
    }
  }

  async function confirmImport() {
    const selected = currentPreview;
    if (!selected || loading) return;
    loading = true;
    error = '';
    try {
      const ret = await requestImport(selected.file, selected.source, false);
      completed = ret.data;
      preview = null;
      addToast({ description: `${ret.data.imported} imported, ${ret.data.merged} merged`, status: 'success' });
      // A refresh failure must not make a committed import appear to have failed.
      const refreshed = await Promise.allSettled([fetchTags(), fetchGroups()]);
      if (refreshed.some((result) => result.status === 'rejected')) {
        addToast({ description: 'Import saved. Reload to refresh tags and groups.', status: 'warning' });
      }
    } catch (e) {
      preview = null;
      showError(e);
    } finally {
      loading = false;
    }
  }
</script>

{@render children?.()}
<div class="import-options">
  <FieldSelect
    label="Existing bookmarks"
    options={duplicateOptions}
    bind:value={duplicates}
    onchange={resetPreview}
    disabled={loading}
    description={duplicates === 'skip'
      ? 'Keep existing bookmarks unchanged.'
      : 'Add tags without changing existing titles, descriptions, or folders.'}
  />
  <p>Maximum 10 MiB and {IMPORT_MAX_ROWS.toLocaleString()} bookmarks per file. Preview does not save changes.</p>
</div>
<FileDropZone {accept} {startImport} {loading} onselect={resetPreview} buttonLabel="Preview import" />
{#if error}
  <p role="alert">{error}</p>
{/if}
<div aria-live="polite" aria-busy={loading}>
  {#if loading}
    <p>Processing…</p>
  {/if}
  {#if summary}
    <h3>{summary.preview ? 'Import preview — nothing saved yet' : 'Import complete'}</h3>
    <p>
      {summary.total} total: {summary.imported}
      {summary.preview ? 'to import' : 'imported'},
      {summary.merged}
      {summary.preview ? 'to merge' : 'merged'}, {summary.skipped} skipped,
      {summary.failed} invalid.
    </p>
    <p>
      {summary.duplicates} duplicates found. Duplicate URLs within the file are skipped; the first valid occurrence wins.
    </p>
    {#if summary.issues.length}
      <p>Fix these records and re-import them. Showing the first {summary.issues.length} issues:</p>
      <ul>
        {#each summary.issues as issue (issue.row)}
          <li>Record {issue.row}: {issue.message}</li>
        {/each}
      </ul>
    {/if}
    {#if currentPreview}
      <p>Counts are checked again when you confirm. Invalid records will not be imported.</p>
      <Button disabled={loading || summary.count === 0} onclick={confirmImport}>Confirm import</Button>
    {/if}
  {/if}
</div>

<style>
  .import-options {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
  }
</style>
