export async function fetchMeta(url: string) {
  const mod = await import('html-metadata-parser');
  const parser =
    mod.parser && typeof mod.parser === 'function'
      ? mod.parser
      : mod.default && typeof mod.default === 'function'
      ? mod.default
      : // @ts-ignore
        mod.default?.parser;
  const result = await parser(url);
  return {
    url,
    title: result.og?.title || result.meta?.title || '',
    desc: result.og?.description || result.meta?.description || '',
  };
}
