const CR = '\r';
const NL = '\n';

export type VisitorFn = (input: string[]) => unknown;
export class ParserError extends Error {}

// CSV records support escaped quotes, embedded newlines, and empty trailing cells.
export class Parser {
  constructor(
    private input: string,
    private visitor: VisitorFn,
    private maxColumns = Infinity,
  ) {}

  parse() {
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    let closedQuote = false;
    let hasContent = false;

    const finishCell = () => {
      if (row.length >= this.maxColumns) throw new ParserError(`Too many columns (maximum ${this.maxColumns})`);
      row.push(cell);
      cell = '';
      closedQuote = false;
    };
    const finishRow = () => {
      finishCell();
      if (hasContent) this.visitor(row);
      row = [];
      hasContent = false;
    };

    for (let i = 0; i < this.input.length; i++) {
      const c = this.input[i];
      if (quoted) {
        if (c !== '"') {
          cell += c;
        } else if (this.input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closedQuote = true;
        }
        continue;
      }
      if (c === ',') {
        hasContent = true;
        finishCell();
      } else if (c === NL || c === CR) {
        finishRow();
        if (c === CR && this.input[i + 1] === NL) i++;
      } else if (closedQuote) {
        if (c !== ' ' && c !== '\t') throw new ParserError('Unexpected text after a closing quote');
      } else if (c === '"' && cell === '') {
        quoted = true;
        hasContent = true;
      } else {
        cell += c;
        if (c.trim()) hasContent = true;
      }
    }
    if (quoted) throw new ParserError('Unclosed quoted field');
    if (hasContent) finishRow();
  }
}
