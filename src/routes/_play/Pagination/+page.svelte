<script lang="ts">
  import Pagination from '$lib/components/pagination/Pagination.svelte';
</script>

<main>
  <section>
    <Pagination previous="/p" next="/n" current={8} total={30} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={1} total={5} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={4} total={5} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={8} total={30} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={27} total={30} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={30} total={30} />
  </section>
  <section>
    <Pagination previous="/p" next="/n" current={1} total={2} />
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
