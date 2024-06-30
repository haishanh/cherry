<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // var d = document;
    // prettier-ignore
    function create(d: Document,a: number) {
      var e = d.createElement('div');
      e.innerText = a?'Cherry Picked!':'Something went wrong!';
      var c = e.style;
      c.position='fixed';c.padding='15px';c.bottom='15px';
      c.left='15px';c.transform='translateY(150%)';c.transition='transform 0.3s linear';
      c.color='#fff';c.borderRadius='8px';c.zIndex='2147483647';
      c.background=a?'rgb(56,161,105)':'rgb(228, 62, 62)';
      d.body.appendChild(e);
      setTimeout(() => {
        c.transform = 'translateY(0)';
        setTimeout(() => {
          c.transform = 'translateY(150%)';
          setTimeout(()=>d.body.removeChild(e), 600);
        }, 2000);
      }, 1);
    }
    create(document, 0);
    //
  });
</script>

<main>
  <section />
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
