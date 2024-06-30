export type PopoverPlacement = 'north' | 'south';

function positionPopover(node: HTMLDivElement, anchor: HTMLElement, vOffset: number) {
  // popover rect
  const p = node.getBoundingClientRect();
  // anchor rect
  const t = anchor.getBoundingClientRect();

  let placement: PopoverPlacement;
  let top = 0;
  let left = 0;
  const dimension: { height?: number } = {};

  if (t.bottom + vOffset + p.height <= window.innerHeight) {
    // try place below the anchor
    top = t.top + t.height + vOffset + window.scrollY;
    placement = 'south';
  } else if (t.top - vOffset >= p.height) {
    top = t.top - vOffset - p.height + window.scrollY;
    placement = 'north';
  } else {
    const southVerticalReminder = window.innerHeight - t.bottom - vOffset;
    const northVerticalReminder = t.top - vOffset;
    if (southVerticalReminder > northVerticalReminder) {
      top = t.top + t.height + vOffset + window.scrollY;
      placement = 'south';
      dimension.height = southVerticalReminder - 3;
    } else {
      top = t.top - vOffset - p.height + window.scrollY;
      placement = 'north';
      dimension.height = northVerticalReminder - 3;
    }
  }

  const tmid = Math.floor((t.right - t.left) / 2) + t.left;
  // try to center align it if possible
  if (tmid + Math.ceil(p.width / 2) <= window.innerWidth && tmid <= t.left) {
    left = tmid - Math.ceil(p.width / 2) + window.scrollX;
  } else if (t.left >= 0 && t.left + p.width <= window.innerWidth) {
    // try align left edge with the anchor
    left = t.left + window.scrollX;
  } else if (t.right >= p.width) {
    // aight with right edge of the anchor
    left = t.right - p.width + window.scrollX;
  } else {
    // center to the *window*
    left = Math.floor((window.innerWidth - p.width) / 2) + window.scrollX;
  }

  return { position: { top, left }, placement };
}

export function popover(
  node: HTMLDivElement,
  params: {
    vOffset: number;
    anchor: HTMLElement;
    closeFn: () => void;
    onPosition: (opts: { position: { top: number; left: number }; placement: PopoverPlacement }) => void;
  },
) {
  const { anchor, closeFn, onPosition, vOffset } = params;

  requestAnimationFrame(() => {
    onPosition(positionPopover(node, anchor, vOffset));
  });

  function listener(event: MouseEvent | TouchEvent) {
    // in this case it's not a click "outside"
    if (node.contains(event.target as HTMLElement)) return;
    // let the anchor handle mouse event by itself
    if (anchor.contains(event.target as HTMLElement)) return;

    closeFn();
  }

  node.ownerDocument.addEventListener('mousedown', listener);
  return {
    destroy() {
      node.ownerDocument.removeEventListener('mousedown', listener);
    },
  };
}
