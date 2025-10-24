<script lang="ts">
  import { fetchGroups } from '$lib/client/group.store';
  import { fetchTags } from '$lib/client/tag.store';
  import { addToast } from '$lib/components/base/toast/store';
  import { request } from '$lib/utils/http.util';
  import type { Snippet } from 'svelte';

  import FileDropZone from './FileDropZone.svelte';
  import type { DropzoneFiles } from './import.shared';

  type ImportSource = 'chrome' | 'firefox' | 'safari' | 'pocket' | 'csv';
  type Props = {
    accept: string | string[];
    source: ImportSource;
    children?: Snippet;
  };
  let { accept, source, children }: Props = $props();

  function onSuccessImport() {
    fetchTags();
    fetchGroups();
  }

  function requestImport2(data: File, source: ImportSource): Promise<{ data: { count: number } }> {
    let url: string;
    switch (source) {
      case 'chrome':
      case 'firefox':
      case 'safari':
        url = '/api/import/netscape-bookmark-file-1';
        break;
      case 'csv':
        url = '/api/import/csv';
        break;
      case 'pocket':
        url = '/api/import';
        break;
      default:
        throw new Error('unkown import source ' + source);
    }
    return request({ url, method: 'POST', data });
  }

  let loading = $state(false);
  async function startImport(files: DropzoneFiles) {
    const f = files.accepted[0];
    if (!f) return;
    try {
      loading = true;
      const ret = await requestImport2(f, source);
      onSuccessImport();
      const count = ret.data.count;
      addToast({ description: `${count ? count + ' bookmarks' : 'Bookmarks'} imported`, status: 'success' });
    } catch (e) {
      addToast({ description: 'Import failed', status: 'error' });
    } finally {
      loading = false;
      files.accepted = [];
      files.rejected = [];
    }
  }
</script>

{@render children?.()}
<FileDropZone {accept} {startImport} {loading} />
