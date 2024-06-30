import * as htmlparser2 from 'htmlparser2';

export type PocketBookmarkItem = {
  url: string;
  title: string;
  createdAt: number;
  tags: { name: string }[];
};

export function parsePocketExportHtml(html: string): PocketBookmarkItem[] {
  const dom = htmlparser2.parseDocument(html);
  const result = [];
  for (const item of dom.children) {
    if (item.type === 'tag' && item.name === 'html') {
      const nodes = htmlparser2.DomUtils.findAll((elem) => {
        return elem.type === 'tag' && elem.name === 'a' && elem.parent?.type === 'tag' && elem.parent?.name === 'li';
      }, item.children);

      for (const node of nodes) {
        const c = node.children[0];
        const attr = node.attribs;
        if (c && c.type === 'text') {
          const tags = attr.tags;
          const createdAt = parseInt(attr.time_added, 10);
          result.push({
            url: attr.href,
            title: c.data,
            createdAt,
            tags: tags ? tags.split(',').map((name) => ({ name })) : [],
          });
        }
      }
    }
  }
  return result;
}
