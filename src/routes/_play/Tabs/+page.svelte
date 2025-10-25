<script lang="ts">
  import Tab from '$lib/components/base/tabs/Tab.svelte';
  import TabPanel from '$lib/components/base/tabs/TabPanel.svelte';
  import Tabs from '$lib/components/base/tabs/Tabs.svelte';
</script>

<main>
  <section>
    <h1>hdd</h1>
    <Tabs>
      {#snippet tabList()}
        <Tab idx="0" active />
        <Tab idx="1" />
        <Tab idx="2" />
      {/snippet}
      {#snippet panels()}
        <TabPanel idx="0" active>
          <h1>0</h1>
        </TabPanel>
        <TabPanel idx="1">
          <h1>1</h1>
        </TabPanel>
        <TabPanel idx="2">
          <h1>2</h1>
        </TabPanel>
      {/snippet}
    </Tabs>
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
