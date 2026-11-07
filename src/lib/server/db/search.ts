// FTS parameters are still parsed as a query language by SQLite. Quote each
// user-supplied term so URLs/punctuation/operators cannot become FTS syntax.
// Keep ordinary multi-word AND searches and explicitly quoted phrases.
export function toFtsQuery(text: string): string {
  const terms = Array.from(text.replaceAll('\0', ' ').matchAll(/"([^"]*)"|(\S+)/g), (match) =>
    (match[1] ?? match[2]).trim(),
  ).filter(Boolean);
  return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(' AND ') || '""';
}
