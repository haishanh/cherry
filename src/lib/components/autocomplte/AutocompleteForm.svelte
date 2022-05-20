<script lang="ts">
  import { makeId } from '$lib/utils/common.util';

  import Tag from './Tag.svelte';

  let inputElement: HTMLInputElement;

  let expanded = false;

  type TagType = { id: number | string; name: string; isNew?: boolean };
  export let tags: TagType[] = [
    { id: 100, name: 'Hello' },
    { id: 101, name: 'how are you' },
  ];

  type OptionItem = { id: number | string; name: string; isNew?: boolean };
  let options: OptionItem[] = [
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
  let pseudoOption = { id: pseudoId, name: '', isNew: true };

  $: {
    const highlighted = filtered[hiIdx];
    if (inputValue) {
      const newTagName = inputValue.trim();
      filtered = options.filter((o) => {
        const t = newTagName.toLowerCase();
        return o.name.substring(0, t.length).toLowerCase() === t;
      });
      const last = filtered[filtered.length - 1];
      if (last) {
        if (last.id !== pseudoOption.id) {
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
    if (highlighted && idx >= 0) {
      hiIdx = idx;
    } else if (filtered.length > 0) {
      hiIdx = 0;
    }

    ensureItemInView(hiIdx);
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

  function handleInputOnBlur(e: FocusEvent) {
    let activeElement = e.relatedTarget as Node;
    if (activeElement === listbox && inputElement) {
      // not sure why tick().then() is not working
      setTimeout(() => {
        inputElement.focus();
      }, 0);
    } else {
      expanded = false;
    }
  }

  function handleClickItem(e: MouseEvent) {
    e.preventDefault();
    let dIdx = (e.currentTarget as HTMLElement).getAttribute('data-idx');
    if (!dIdx) return;
    const idx = parseInt(dIdx, 10);
    confirmItem(idx);
  }

  function confirmItem(inputIdx: number) {
    let idx = inputIdx;
    const selected = filtered[idx];

    if (selected) {
      tags.push({ ...selected });
      options = options.filter((o) => o.id !== selected.id);
      tags = tags;

      if (idx === hiIdx) {
        hiIdx = 0;
        inputValue = '';
      }
      // user can create multiple new tags
      // we need to give pseudoOption a new id after adding it to the tags
      // to avoid dupicate keys in list
      if (selected.isNew) pseudoOption.id = Date.now();
    }
  }

  function handleOnKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        expanded = false;
        return;
      case 'ArrowDown':
        e.preventDefault();
        if (filtered.length > hiIdx + 1) {
          hiIdx = hiIdx + 1;
        } else if (filtered.length === hiIdx + 1) {
          hiIdx = 0;
        }
        return;
      case 'ArrowUp':
        e.preventDefault();
        if (hiIdx >= 0) {
          if (hiIdx === 0) {
            hiIdx = filtered.length - 1;
          } else {
            hiIdx = hiIdx - 1;
          }
        }
        return;
      case 'Enter':
        e.preventDefault();
        confirmItem(hiIdx);
        return;
      default:
        console.log(e.key);
    }
  }
</script>

<div class="autocomplete-wrapper">
  <div class="autocomplete">
    {#each tags as tag (tag.id)}
      <Tag name={tag.name} />
    {/each}
    <input
      bind:this={inputElement}
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
    <ul tabindex="-1" role="listbox" bind:this={listbox} aria-activedescendant="{idPrefix}-{hiIdx}">
      {#each filtered as item, idx (item.id)}
        <li
          role="option"
          id="{idPrefix}-{item.id}"
          class:hi={idx === hiIdx}
          aria-selected={idx === hiIdx}
          data-idx={idx}
          on:click={handleClickItem}
        >
          <span>{item.name}</span>
          {#if item.isNew}
            <span>New tag</span>
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
    cursor: pointer;
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
