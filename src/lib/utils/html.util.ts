import type { AnyNode, ChildNode, Element } from 'domhandler';
import * as htmlparser2 from 'htmlparser2';
import axios from 'axios';

export async function fetchMeta(url: string) {
  let title = '';
  let desc = '';
  try {
    const html = await grabHtml(url);
    const ret = parseMeta(html);
    title = ret?.title ?? '';
    desc = ret?.desc ?? '';
  } catch (e) {
    // ignore
  }
  return { url, title, desc };
}

function findOneElement(nodes: ChildNode[], predicate: (elem: AnyNode) => boolean) {
  const [a] = htmlparser2.DomUtils.find(predicate, nodes, false, 1) as Element[];
  return a;
}

async function grabHtml(url: string) {
  const { data } = await axios(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml',
    },
  });
  return data;
}

function retrieveTitle(nodes: ChildNode[]) {
  let title = '';

  const metaTitleElem = findOneElement(nodes, (elem) => {
    if (elem.type !== 'tag' || elem.name !== 'meta') return false;
    return elem.attribs.property === 'og:title';
  });

  if (metaTitleElem) {
    title = metaTitleElem.attribs.content;
    if (title) return title;
  }

  const titleElem = findOneElement(nodes, (elem) => {
    return elem.type === 'tag' && elem.name === 'title';
  });

  if (titleElem && titleElem.children) {
    for (const n of titleElem.children) {
      if (n.type === 'text' && typeof n.data === 'string' && n.data !== '') {
        title = n.data;
      }
    }
  }

  return title;
}

function retrieveDesc(nodes: ChildNode[]) {
  let desc = '';

  const metaOgDescElem = findOneElement(nodes, (elem) => {
    if (elem.type !== 'tag' || elem.name !== 'meta') return false;
    return elem.attribs.property === 'og:description';
  });
  if (metaOgDescElem) {
    desc = metaOgDescElem.attribs.content;
    if (desc) return desc;
  }

  const elem2 = findOneElement(nodes, (elem) => {
    return elem.type === 'tag' && elem.name === 'meta' && elem.attribs.name === 'description';
  });

  if (elem2 && elem2.attribs.content) {
    desc = elem2.attribs.content;
  }

  return desc;
}

export function parseMeta(html: string) {
  const dom = htmlparser2.parseDocument(html);
  const [head] = htmlparser2.DomUtils.find(
    (elem) => elem.type === 'tag' && elem.name === 'head',
    dom.children,
    true,
    1,
  );
  if (!head || !('children' in head)) return;
  const title = retrieveTitle(head.children);
  const desc = retrieveDesc(head.children);
  return { title, desc };
}
