<script lang="ts">
  import ChevronDown from '@hsjs/svelte-icons/feather/ChevronDown.svelte';

  import VisuallyHidden from '../base/VisuallyHidden.svelte';
  import { fuzzysearch } from './fuzzy';
  import ListboxList from './ListboxList.svelte';
  import ListboxOptionGroup from './ListboxOptionGroup.svelte';

  type OptionType = { name: string; id?: number };

  export let id: string;
  export let group: { name: string; id: number } | null = null;
  export let options: OptionType[] = [];
  export let canCreate = true;
  export let inputValue = '';

  let inputElement: HTMLInputElement;

  let init = false;
  $: {
    if (!init && group?.name) {
      inputValue = group.name;
      init = true;
    }
  }

  let orignalOptions = [...options];
  let filtered: OptionType[] = orignalOptions;
  $: {
    // ensure orignalOptions is updated after fetching groups
    // filtered will be automatically get udpdated too (`options` is used in a $reactive block below this one)
    orignalOptions = [...options];
  }

  $: {
    if (inputValue) {
      const ivalue = inputValue.trim();
      let containsInputValue = false;
      filtered = options.filter((o) => {
        if (!o.name) return false;
        const t = ivalue.toLowerCase();
        const n = o.name.toLowerCase();
        const match = fuzzysearch(t, n);
        if (match && t.length === o.name.length) containsInputValue = true;
        return match;
      });

      if (canCreate && !containsInputValue) {
        const last = filtered[filtered.length - 1];
        if (last) {
          if ('id' in last) {
            filtered.push({ name: ivalue });
            filtered = filtered;
          } else if (last.name !== ivalue) {
            last.name = ivalue;
            filtered = filtered;
          }
        } else {
          filtered.push({ name: ivalue });
          filtered = filtered;
        }
      }
    } else if (filtered != orignalOptions) {
      filtered = orignalOptions;
    }
  }

  $: {
    if (filtered.length === 0) close();
  }

  let expanded = false;
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

  function handleConfirmSelection(e: CustomEvent<{ name: string; id: number }>) {
    const d = e.detail;
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
    <ChevronDown size={20} />
    <VisuallyHidden>Show suggestions</VisuallyHidden>
  </button>
  {#if expanded && filtered.length > 0}
    <ListboxList {filtered} let:item on:confirm={handleConfirmSelection}>
      <ListboxOptionGroup {item} />
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
