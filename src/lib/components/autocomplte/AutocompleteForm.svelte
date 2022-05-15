<script lang="ts">
  import { makeId } from '$lib/utils/common.util';

  import Tag from './Tag.svelte';

  let expanded = false;

  type OptionItem = { id: number | string; name: string; note?: string };
  const options: OptionItem[] = [
    { id: 1, name: 'White' },
    { id: 2, name: 'Red' },
    { id: 3, name: 'Yellow' },
    { id: 4, name: 'Green' },
    { id: 5, name: 'Blue' },
    { id: 6, name: 'Black' },
  ];

  let filtered = [...options];
  // highlighted idx
  let hiIdx = 0;
  let inputValue = '';

  let pseudoId = Date.now();
  let pseudoOption = { id: pseudoId, name: '', note: 'New tag' };

  $: {
    console.log('$1', JSON.stringify(filtered));
    console.log('$1', hiIdx);
    const highlighted = filtered[hiIdx];
    if (inputValue) {
      const newTagName = inputValue.trim();
      filtered = options.filter((o) => {
        const t = newTagName.toLowerCase();
        return o.name.substring(0, t.length).toLowerCase() === t;
      });
      const last = filtered[filtered.length - 1];
      if (last) {
        if (last.id !== pseudoId) {
          pseudoOption.name = newTagName;
          filtered.push(pseudoOption);
          filtered = filtered;
        } else if (last.name !== newTagName) {
          last.name = newTagName;
          filtered = filtered;
        }
      } else {
        pseudoOption.name = newTagName;
        filtered.push(pseudoOption);
        filtered = filtered;
      }
    } else {
      filtered = [...options];
    }

    const idx = filtered.indexOf(highlighted);
    console.log('--', idx);
    if (highlighted && idx >= 0) {
      hiIdx = idx;
    } else if (filtered.length > 0) {
      hiIdx = 0;
    }
    // eslint-disable-next-line no-console
    console.log('$2', hiIdx);

    ensureItemInView(hiIdx);
    console.log('$2', JSON.stringify(filtered));
  }

  let idPrefix = makeId();

  let listbox: HTMLElement;

  // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-scrollable.html
  // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/js/listbox.js
  function ensureItemInView(idx: number) {
    if (!listbox) return;
    const item = filtered[idx];
    if (!item) return;
    const id = idPrefix + '-' + item.id;
    if (listbox.scrollHeight > listbox.clientHeight) {
      // ele is element to be highlighted
      const ele = document.getElementById(id);
      if (!ele) return;
      const elementBottom = ele.offsetTop + ele.offsetHeight;
      const scrollBottom = listbox.clientHeight + listbox.scrollTop;
      if (elementBottom > scrollBottom) {
        listbox.scrollTop = elementBottom - listbox.clientHeight;
      } else if (ele.offsetTop < listbox.scrollTop) {
        listbox.scrollTop = ele.offsetTop;
      }
    }
  }

  function handleInputOnFocus() {
    expanded = true;
  }

  function handleInputOnBlur() {
    // expanded = false;
  }

  function handleOnKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      expanded = false;
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // eslint-disable-next-line no-console
      console.log(filtered.length, hiIdx);
      if (filtered.length > hiIdx + 1) {
        hiIdx = hiIdx + 1;
      } else if (filtered.length === hiIdx + 1) {
        hiIdx = 0;
      }
      console.log(filtered.length, hiIdx);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (hiIdx >= 0) {
        if (hiIdx === 0) {
          hiIdx = filtered.length - 1;
        } else {
          hiIdx = hiIdx - 1;
        }
      }
      return;
    }
    if (e.key === 'Enter') {
      // TODO
    }
    // eslint-disable-next-line no-console
    console.log(e.key);
  }
</script>

<div class="autocomplete-wrapper">
  <div class="autocomplete">
    <Tag name="hello" />
    <Tag name="how are you" color="1" />
    <Tag name="how are you" color="2" />
    <Tag name="how are you" color="1" />
    <Tag name="how are you" color="2" />
    <Tag name="how are you" color="2" />
    <Tag name="how are you" />
    <Tag name="how are you" color="2" />
    <Tag name="how are you" />
    <Tag name="how are you" color="1" />
    <Tag name="how are you" />
    <input
      autocomplete="off"
      autocapitalize="none"
      spellcheck="false"
      placeholder="Add tags..."
      bind:value={inputValue}
      on:focus={handleInputOnFocus}
      on:blur={handleInputOnBlur}
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={expanded}
      on:keydown={handleOnKeydown}
    />
  </div>
  <!-- listbox -->
  {#if expanded}
    <ul role="listbox" bind:this={listbox} aria-activedescendant="{idPrefix}-{hiIdx}">
      {#each filtered as item, idx (item.id)}
        <li role="option" id="{idPrefix}-{item.id}" class:hi={idx === hiIdx} aria-selected={idx === hiIdx}>
          <span>{item.name}</span>
          {#if item.note}
            <span>{item.note}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  .autocomplete-wrapper {
    position: relative;
  }
  .autocomplete {
    // height: 40px;
    width: 100%;
    margin: 1px 0;
    padding: 8px 5px;
    border-radius: 7px;
    border: 1px solid var(--color-input-bo);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    &:focus-within {
      border-color: var(--color-focus-blue);
    }
  }
  input {
    flex: 1;
    outline: none;
    background: none;
    border: none;
    padding: 5px;
    font-size: inherit;
    font-family: inherit;
    min-width: 100px;
    // background-color: pink;
  }
  ul {
    position: absolute;
    top: calc(100% + 2px);
    width: 100%;
    z-index: 1;
    background-color: var(--bg-card);
    list-style: none;
    margin: 0;
    padding: 0;
    border-radius: 7px;
    max-height: 120px;
    overflow-y: auto;
    // prettier-ignore
    box-shadow: 0 1px 1px rgba(0,0,0,0.1),
                0 2px 2px rgba(0,0,0,0.1),
                0 4px 4px rgba(0,0,0,0.1),
                0 8px 10px rgba(0,0,0,0.1);
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1;
    padding: 0 8px;
    border-radius: 7px;
    height: 30px;
    border: 1px solid transparent;
    &:hover {
      background-color: var(--bg-v0);
      border-color: var(--color-input-bo-hover);
    }
    &.hi {
      background-color: var(--bg-v0);
      border-color: var(--color-input-bo-hover);
    }
  }
</style>
