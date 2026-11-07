<script lang="ts" generics="Value extends string">
  import { CheckIcon, ChevronDownIcon } from '@lucide/svelte';

  type Props = {
    label: string;
    value: Value;
    options: { value: Value; name: string }[];
    description?: string;
    disabled?: boolean;
    onchange?: (value: Value) => void;
  };

  let { label, value = $bindable(), options, description, disabled = false, onchange }: Props = $props();
  const id = $props.id();
  let root: HTMLDivElement;
  let expanded = $state(false);
  let activeIndex = $state(0);
  const selected = $derived(options.find((option) => option.value === value));
  const isOpen = $derived(expanded && !disabled && options.length > 0);

  function open() {
    if (disabled || options.length === 0) return;
    activeIndex = Math.max(
      0,
      options.findIndex((option) => option.value === value),
    );
    expanded = true;
  }

  function choose(index: number) {
    const option = options[index];
    if (disabled || !option) return;
    expanded = false;
    if (value !== option.value) {
      value = option.value;
      onchange?.(value);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled || options.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) open();
        else activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        break;
      case 'Home':
      case 'End':
        event.preventDefault();
        open();
        activeIndex = event.key === 'Home' ? 0 : options.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) choose(activeIndex);
        else open();
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          event.stopPropagation();
          expanded = false;
        }
        break;
      case 'Tab':
        expanded = false;
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const index = options.findIndex((option) => option.name.toLowerCase().startsWith(event.key.toLowerCase()));
          if (index >= 0) {
            event.preventDefault();
            open();
            activeIndex = index;
          }
        }
    }
  }

  function handleOutsidePointer(event: PointerEvent) {
    if (isOpen && !root.contains(event.target as Node)) expanded = false;
  }
</script>

<svelte:document onpointerdown={handleOutsidePointer} />

<div bind:this={root}>
  <label id="{id}-label" for={id}>{label}</label>
  <div class="select-wrapper">
    <button
      {id}
      type="button"
      class="trigger"
      role="combobox"
      disabled={disabled || options.length === 0}
      aria-labelledby="{id}-label"
      aria-describedby={description ? `${id}-description` : undefined}
      aria-controls="{id}-listbox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-activedescendant={isOpen ? `${id}-option-${activeIndex}` : undefined}
      onclick={() => (isOpen ? (expanded = false) : open())}
      onkeydown={handleKeydown}
      onblur={() => (expanded = false)}
    >
      <span>{selected?.name ?? ''}</span>
      <ChevronDownIcon size={20} />
    </button>
    {#if isOpen}
      <div id="{id}-listbox" class="listbox" role="listbox" aria-labelledby="{id}-label">
        {#each options as option, index (option.value)}
          <button
            id="{id}-option-{index}"
            type="button"
            class={['option', { highlighted: activeIndex === index }]}
            role="option"
            aria-selected={value === option.value}
            tabindex="-1"
            onpointerdown={(event) => event.preventDefault()}
            onpointermove={() => (activeIndex = index)}
            onclick={() => choose(index)}
          >
            <span>{option.name}</span>
            {#if value === option.value}<CheckIcon size={17} />{/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
  {#if description}<p id="{id}-description" class="description">{description}</p>{/if}
</div>

<style>
  label {
    line-height: 1.8;
  }
  .select-wrapper {
    position: relative;
  }
  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    border-radius: 7px;
  }
  .trigger {
    height: 40px;
    padding: 0 10px;
    outline: none;
    border: 1px solid var(--color-input-bo);
    background: var(--color-input-bg);
  }
  .trigger:hover:not(:disabled) {
    border-color: var(--color-input-bo-hover);
  }
  .trigger:focus {
    box-shadow: var(--focus-shadow);
  }
  .trigger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .listbox {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    width: 100%;
    z-index: 10;
    padding: 10px 5px;
    border: 1px solid var(--color-input-bo);
    border-radius: 7px;
    background: var(--bg-card);
    box-shadow:
      0 1px 1px rgb(0 0 0 / 10%),
      0 2px 2px rgb(0 0 0 / 10%),
      0 4px 4px rgb(0 0 0 / 10%),
      0 8px 10px rgb(0 0 0 / 10%);
  }
  .option {
    min-height: 32px;
    padding: 6px 8px;
    line-height: 1.2;
    border: 1px solid transparent;
    background: none;
  }
  .option.highlighted {
    background: hsla(94deg, 99%, 33%, 0.4);
  }
  .description {
    margin: 6px 0 0;
    color: var(--color-text3);
    font-size: 14px;
    line-height: 1.5;
  }
</style>
