<script lang="ts">
  import { SearchIcon } from '@lucide/svelte';
  import invariant from 'tiny-invariant';

  import ForwardSlash from '$lib/components/base/icons/ForwardSlash.svelte';
  import type { NewTagType, TagType } from '$lib/type';

  import Button from '../base/Button.svelte';
  import VisuallyHidden from '../base/VisuallyHidden.svelte';
  import { fuzzysearch } from './fuzzy';
  import ListboxList from './ListboxList.svelte';
  import ListboxOptionTag from './ListboxOptionTag.svelte';
  import Tag from './Tag.svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { makeId } from '../base/tabs/tabs.ctx';

  const noop = () => {};

  let {
    focus0 = noop,
    blur0 = noop,
    tags = $bindable([]),
    options = [],
    canCreate = true,
    search = false,
    inputValue = $bindable(''),
    placeholder = 'Add tags...',
    autoSelect = false,
    focusWithForwardSlashKey = false,
    // focus = () => {
    //   if (inputRef) inputRef.focus();
    // },
  } = $props();

  const listboxId = `lb${makeId()}`;

  export function focus() {
    if (inputRef) inputRef.focus();
  }

  let inputRef: HTMLInputElement;

  type AllTagType = TagType | NewTagType;

  // export let tags: AllTagType[] = [];
  // export let options: TagType[] = [];

  const EVENT = {
    focus0: 'focus0',
    blur0: 'blur0',
  };

  let filtered: AllTagType[] = $state([...options]);

  function resetInput() {
    inputValue = '';
  }

  let tagMap: Map<string, number>;

  $effect(() => {
    tagMap = new SvelteMap();
    for (const t of tags) {
      if (!t || !t.name) {
        // console.log('TagAutocomplete', JSON.stringify(tags));
        continue;
      }
      tagMap.set(t.name, 1);
    }
  });

  function handleConfirmSelection(d: AllTagType) {
    const tag: { name: string; id?: number } = { name: d.name };
    if ('id' in d) tag.id = d.id;
    tags.push(tag);
    tags = tags;
    resetInput();
  }

  $effect(() => {
    const prefiltered = options.filter((o) => !tagMap.get(o.name));
    if (inputValue) {
      const newTagName = inputValue.trim();
      let containsInputValue = false;
      filtered = prefiltered.filter((o) => {
        if (!o.name) return false;
        const t = newTagName.toLowerCase();
        const n = o.name.toLowerCase();
        const match = fuzzysearch(t, n);
        if (match && t.length === o.name.length) containsInputValue = true;
        return match;
      });
      if (canCreate && !containsInputValue) {
        const last = filtered[filtered.length - 1];
        if (last) {
          if ('id' in last) {
            filtered.push({ name: newTagName });
            filtered = filtered;
          } else if (last.name !== newTagName) {
            last.name = newTagName;
            filtered = filtered;
          }
        } else {
          filtered.push({ name: newTagName });
          filtered = filtered;
        }
      }
    } else {
      filtered = prefiltered;
    }
  });

  $effect(() => {
    if (filtered.length === 0) close();
  });

  let expanded = $state(false);
  const open = () => (!expanded ? (expanded = true) : undefined);
  const close = () => (expanded ? (expanded = false) : undefined);

  let focused = $state(false);
  function handleInputOnInput() {
    open();
  }

  function handleInputOnFocus() {
    focused = true;
    focus0();
    open();
  }

  function handleInputOnBlur(_e: FocusEvent) {
    close();
    focused = false;
    // dispatch(EVENT.blur0);
    // let activeElement = e.relatedTarget as HTMLDivElement;
    // // TODO to improve this
    // if (activeElement && activeElement.hasAttribute('data-cherry-listbox') && inputElement) {
    //   // not sure why tick().then() is not working
    //   setTimeout(() => inputElement.focus(), 0);
    // } else {
    //   close();
    // }
  }

  function handleClickCloseTag(tag: { name: string }) {
    // const tag = e.detail;
    invariant(tag, 'handleClickCloseTag: something went wrong');
    tags = tags.filter((t) => t !== tag);
    // dispatch('change', [...tags]);
  }

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        if (inputRef) inputRef.blur();
        // close();
        return;
      default:
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="autocomplete-wrapper">
  <div class="autocomplete" class:round={search}>
    {#each tags as tag (tag.name)}
      <Tag {tag} clickclose={handleClickCloseTag} />
    {/each}
    <input
      autocomplete="off"
      autocapitalize="none"
      spellcheck="false"
      bind:this={inputRef}
      {placeholder}
      bind:value={inputValue}
      onfocus={handleInputOnFocus}
      oninput={handleInputOnInput}
      onblur={handleInputOnBlur}
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={expanded}
    />

    {#if focusWithForwardSlashKey && !focused}
      <ForwardSlash />
    {/if}

    {#if search}
      <div class="search-wrapper">
        <Button modifier={['minimal', 'circular']} type="submit">
          <VisuallyHidden>Search</VisuallyHidden>
          <span class="search-icon-wrapper"><SearchIcon size={16} /></span>
        </Button>
      </div>
    {/if}
  </div>
  <!-- listbox -->
  {#if expanded && filtered.length > 0}
    <ListboxList id={listboxId} {autoSelect} {filtered} onconfirm={handleConfirmSelection}>
      {#snippet itemComp(item)}
        <ListboxOptionTag {item} />
      {/snippet}
    </ListboxList>
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
    padding: 4px 5px;
    border-radius: 7px;
    border: 1px solid var(--color-input-bo);
    background-color: var(--color-input-bg);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;

    &:focus-within {
      box-shadow: var(--focus-shadow);
    }
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    &.round {
      border-radius: 20px;
    }
  }

  .search-wrapper .search-icon-wrapper {
    display: inline-flex;
  }

  .autocomplete {
    &:focus-within {
      .search-icon-wrapper {
        color: var(--color-input-bo-hover);
      }
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
    height: 30px;
  }
</style>
