<script lang="ts">
  import { ChevronDownIcon } from '@lucide/svelte';
  import { makeId } from '$lib/utils/common.util';

  import VisuallyHidden from '../base/VisuallyHidden.svelte';
  import { fuzzysearch } from './fuzzy';
  import ListboxList from './ListboxList.svelte';
  import ListboxOptionGroup from './ListboxOptionGroup.svelte';
  import { untrack } from 'svelte';

  type OptionType = { name: string; id?: number };

  type Props = {
    id: string;
    group: { name: string; id?: number } | null;
    options: OptionType[];
    canCreate: boolean;
    inputValue?: string;
  };
  let { id, group = $bindable(null), options = [], canCreate = true, inputValue = '' }: Props = $props();

  let inputElement: HTMLInputElement;

  const listboxId = `lb${makeId()}`;

  let init = false;
  $effect(() => {
    if (!init && group?.name) {
      inputValue = group.name;
      init = true;
    }
  });

  let filtered = $derived.by(() => {
    if (!inputValue) return options;

    const needle = inputValue.trim().toLowerCase();
    let containsInputValue = false;
    const ret = options.filter((o) => {
      if (!o.name) return false;
      const haystack = o.name.toLowerCase();
      const match = fuzzysearch(needle, haystack);
      if (match && needle.length === o.name.length) containsInputValue = true;
      return match;
    });
    if (canCreate && !containsInputValue) ret.push({ name: inputValue });
    return ret;
  });

  $effect(() => {
    if (filtered.length === 0) untrack(close);
  });

  let expanded = $state(false);
  const open = () => (!expanded ? (expanded = true) : undefined);
  const close = () => (expanded ? (expanded = false) : undefined);

  function onFocus() {
    open();
  }
  function onBlur() {
    close();

    if (group && group.name && group.name !== inputValue.trim()) {
      group = null;
      inputValue = '';
    }
  }
  function handleInputOnInput() {
    open();
  }
  function handleClickExpandButton(event: MouseEvent) {
    event.preventDefault();
    inputElement?.focus();
  }

  function handleConfirmSelection<Item extends { name: string }>(d: Item) {
    // const g: { name: string; id?: number } = { name: d.name };
    // if ('id' in d) g.id = d.id;
    close();
    group = { ...d };
    inputValue = group.name;
  }
</script>

<div class="autocomplete-wrapper" {id}>
  <input
    bind:this={inputElement}
    bind:value={inputValue}
    autocomplete="off"
    autocapitalize="none"
    spellcheck="false"
    onfocus={onFocus}
    oninput={handleInputOnInput}
    onblur={onBlur}
    role="combobox"
    aria-controls={listboxId}
    aria-autocomplete="list"
    aria-haspopup="listbox"
    aria-expanded={expanded}
  />
  <button
    class="icon"
    onclick={handleClickExpandButton}
    tabindex="-1"
    aria-label="Show suggestions"
    aria-haspopup="listbox"
  >
    <ChevronDownIcon size={20} />
    <VisuallyHidden>Show suggestions</VisuallyHidden>
  </button>
  {#if expanded && filtered.length > 0}
    <ListboxList id={listboxId} {filtered} onconfirm={handleConfirmSelection}>
      {#snippet itemComp(item)}
        <ListboxOptionGroup {item} />
      {/snippet}
    </ListboxList>
  {/if}
</div>

<style lang="scss">
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;

    appearance: none;
    outline: none;
    user-select: none;
    cursor: pointer;
    background: none;
    border: none;
    padding: 5px;
  }
  .autocomplete-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    position: relative;
    height: 40px;
    width: 100%;
    padding: 15px 10px;
    outline: none;
    border-radius: 7px;
    font-size: inherit;
    border: 1px solid var(--color-input-bo);
    background-color: var(--color-input-bg);
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    &:focus-within {
      box-shadow: var(--focus-shadow);
    }
  }

  input {
    flex: 1;
    outline: none;
    background: none;
    border: none;
    font-size: inherit;
    font-family: inherit;
    min-width: 100px;
    height: 30px;
  }
</style>
