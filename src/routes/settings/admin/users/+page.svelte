<script lang="ts">
  import type { PageData } from './$types';
  // import { amp, browser, dev, mode, prerendering } from 'app/env';
  let { data }: { data: PageData } = $props();
</script>

<h1>admin/users</h1>
<pre>
  {JSON.stringify(data, null, 2)}
</pre>
