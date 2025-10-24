<script lang="ts">
  import firefoxLogoUrl from '$lib/components/base/icons/firefox.svg';
  import safariLogoUrl from '$lib/components/base/icons/safari.svg';

  import CsvFile from '$lib/components/base/icons/CsvFile.svelte';
  import Pocket from '$lib/components/base/icons/Pocket.svelte';
  import Chrome from '$lib/components/base/icons/Chrome.svelte';
  import Tab from '$lib/components/base/tabs/Tab.svelte';
  import TabPanel from '$lib/components/base/tabs/TabPanel.svelte';
  import Tabs from '$lib/components/base/tabs/Tabs.svelte';

  import ImportFromChrome from './ImportFromChrome.svelte';
  import ImportFromCsv from './ImportFromCsv.svelte';
  import ImportFromFirefox from './ImportFromFirefox.svelte';
  import ImportFromPocket from './ImportFromPocket.svelte';
  import ImportFromSafari from './ImportFromSafari.svelte';
</script>

<Tabs>
  {#snippet tabList()}
    <Tab idx="pocket" active>
      <div class="item-brand-title"><Pocket size={30} /> Pocket</div>
    </Tab>
    <Tab idx="chrome">
      <div class="item-brand-title"><Chrome size={30} /> Chrome</div>
    </Tab>
    <Tab idx="firefox">
      <div class="item-brand-title">
        <figure class="icon" style="background-image:url({firefoxLogoUrl});"></figure>
        <span>Firefox</span>
      </div>
    </Tab>
    <Tab idx="safari">
      <div class="item-brand-title">
        <figure class="icon" style="background-image:url({safariLogoUrl});"></figure>
        <span>Safari</span>
      </div>
    </Tab>
    <Tab idx="csv">
      <div class="item-brand-title"><CsvFile size={30} /> CSV</div>
    </Tab>
  {/snippet}
  {#snippet panels()}
    <TabPanel idx="pocket" active>
      <ImportFromPocket />
    </TabPanel>
    <TabPanel idx="chrome">
      <ImportFromChrome />
    </TabPanel>
    <TabPanel idx="firefox">
      <ImportFromFirefox />
    </TabPanel>
    <TabPanel idx="safari">
      <ImportFromSafari />
    </TabPanel>
    <TabPanel idx="csv">
      <ImportFromCsv />
    </TabPanel>
  {/snippet}
</Tabs>

<style lang="scss">
  .item-brand-title {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .icon {
    width: 30px;
    height: 30px;
    background-size: 30px 30px;
    background-repeat: no-repeat;
    margin: 0;
  }
</style>
