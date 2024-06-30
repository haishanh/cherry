// Simple naïve CSV parser (don't use in other projects)

const CR = '\r';
const NL = '\n';

export type VisitorFn = (input: string[]) => unknown;

// export class ParserError extends Error {}

export class Parser {
  private len: number;
  private input: string;
  private idx: number;
  private visitor: VisitorFn;

  constructor(input: string, visitor: VisitorFn) {
    this.len = input.length;
    this.input = input;
    this.idx = 0;
    this.visitor = visitor;
  }

  isNewLine() {
    return this.input[this.idx] === NL || (this.input[this.idx] === CR && this.input[this.idx + 1] === NL);
  }

  eatNewLine() {
    if (this.input[this.idx] === NL) {
      this.idx++;
      return true;
    }
    if (this.input[this.idx] === CR && this.input[this.idx + 1] === NL) {
      this.idx = this.idx + 2;
      return true;
    }
  }

  eatComma() {
    if (this.input[this.idx] === ',') {
      this.idx++;
      return true;
    }
  }

  // idx should point at the open '"'
  parseString(): string {
    // skip open '"'
    const start = ++this.idx;
    for (; this.idx < this.len; this.idx++) {
      if (this.input[this.idx] === '"') {
        return this.input.substring(start, this.idx++);
      }
    }
    return this.input.substring(start, this.len);
  }

  parseCell(): string {
    const start = this.idx;
    for (; this.idx < this.len; this.idx++) {
      if (this.input[this.idx] === ',' || this.isNewLine()) {
        return this.input.substring(start, this.idx);
      }
    }
    return this.input.substring(start, this.len);
  }

  skipSpaces() {
    for (; this.idx < this.len; this.idx++) {
      if (this.input[this.idx] !== ' ') {
        break;
      }
    }
  }

  parseHeader() {
    const header: string[] = [];
    for (; this.idx < this.len; ) {
      const c = this.input[this.idx];
      if (c === '"') {
        header.push(this.parseString());
        this.skipSpaces();
        this.eatComma();
      } else if (this.eatNewLine()) {
        break;
      } else {
        header.push(this.parseCell());
        this.eatComma();
      }
    }

    if (header.length !== 0) this.visitor(header);
  }

  parse() {
    for (; this.idx < this.len; ) {
      this.parseHeader();
    }
  }
}
