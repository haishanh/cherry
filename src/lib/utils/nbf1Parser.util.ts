import assert from 'node:assert';

export type VisitorFn = (input: { group: string[]; attr: Record<string, string>; text: string }) => any;

// https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa753582(v=vs.85)?redirectedfrom=MSDN

export class Parser {
  private len: number;
  private input: string;
  private idx: number;
  private visitor: VisitorFn;

  // <abc>text</abc>
  //     ^
  // expect cursor here or before
  parseTagTextContent() {
    let open: number;
    let close: number;

    for (let i = this.idx; i < this.len; i++) {
      this.idx = i;
      const c = this.input[this.idx];
      if (typeof c !== 'string') break;
      if (!open && c === '>') {
        open = this.idx + 1;
      } else if (open && !close && c === '<' && this.input[this.idx + 1] === '/') {
        close = this.idx;
        break;
      }
    }

    return { text: open && close ? this.input.substring(open, close) : '' };
  }

  isWorldChar(c: string) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '-';
  }

  parseAttr() {
    let open = 0;
    let close = 0;

    for (let i = this.idx; i < this.len; i++) {
      this.idx = i;
      const c = this.input[this.idx];
      if (c === '<' || c === '>') break;
      if (!open && this.isWorldChar(c)) {
        open = this.idx;
      } else if (open && !close && !this.isWorldChar(c)) {
        close = this.idx;
        break;
      }
    }

    if (open === 0 || close === 0 || close < open) return;

    const name = this.input.substring(open, close);

    open = 0;
    close = 0;
    this.scanToChar('"');
    this.idx += 1;
    open = this.idx;
    this.scanToChar('"');
    close = this.idx;
    this.idx += 1;

    let value = '';
    if (open && close) {
      value = this.input.substring(open, close);
    }

    return { name, value };
  }

  scanToChar(c: string) {
    for (; this.idx < this.len; this.idx++) {
      if (this.input[this.idx] === c) break;
    }
  }

  // idx stop at the index of "<" of next tag
  // could be close tag
  scanToNextTag() {
    for (; this.idx < this.len; ) {
      this.scanToChar('<');
      break;
    }
  }

  idxToRowCol(idx: number) {
    let row = 1;
    let col = 0;
    for (let i = 0; i <= idx; i++) {
      const c = this.input[i];
      if (c === '\n') {
        col = 0;
        row++;
      } else {
        col++;
      }
    }
    return { row, col };
  }

  bench(name = '') {
    const t = Date.now();
    return () => {
      const d = Date.now() - t;
      if (d > 30) {
        console.log('-> ', name, 'took', d);
        this.print0(name);
        process.exit(1);
      }
      return d;
    };
  }

  parseDl(group: string[]) {
    if (this.idx >= this.len) return;

    for (; this.idx < this.len; ) {
      this.scanToNextTag();
      if (this.input[this.idx] !== '<') break;
      const tag0 = this.peekNextOpenTag();
      if (tag0 === 'DL') {
        this.idx += 3;
        this.parseDl(group);
      } else if (tag0 === 'DT') {
        this.idx += 3;
        this.parseDt(group);
      } else {
        if (tag0 === '/DL') {
          this.idx += 4;
          // stop after parsing a whole <DL> </DL>
          break;
        }
        this.idx++;
      }
    }
  }

  print0(section: string, i?: number) {
    const idx = typeof i === 'number' ? i : this.idx;
    console.log(section);
    console.log('        ', this.idxToRowCol(idx));
    console.log('        ', this.input.substring(idx - 8, idx + 8));
    console.log('        ', '        ^');
  }

  peekNextOpenTag() {
    const c = this.input[this.idx];
    if (c) {
      if (c !== '<') {
        this.print0('peekNextOpenTag');
      }
      assert(c === '<', 'peekNextOpenTag should start with a <');
    }
    let i = this.idx;
    for (; i < this.len; i++) {
      // this.idx = i;
      if (this.input[i] === '>' || this.input[i] === ' ') break;
    }
    return this.input.substring(this.idx + 1, i);
  }

  parseDt(group: string[]) {
    if (this.idx >= this.len) return;

    this.scanToNextTag();
    if (this.input[this.idx] !== '<') return;
    const tag0 = this.peekNextOpenTag();

    // case 1
    //
    // <DT><H3 FOLDED ADD_DATE="{date}">{title}</H3>
    // <DL><p>
    //     {item}
    //     {item}
    //     .
    //     .
    //     .
    // </DL><p>

    // case2
    //
    // <DT><A HREF="{url}" ADD_DATE="{date}" ... >{title}</A>

    if (tag0 === 'H3') {
      this.idx += 3;
      const cnt = this.parseTagTextContent();
      const groupNext = [...group, cnt.text];
      for (; this.idx < this.len; ) {
        this.scanToNextTag();
        if (this.input[this.idx] !== '<') break;
        const tag1 = this.peekNextOpenTag();
        if (tag1 === 'DL') {
          this.idx += 3;
          this.parseDl(groupNext);
          break;
        } else {
          this.idx++;
        }
      }
    } else if (tag0 === 'A') {
      this.idx += 2;
      const attributes = [];

      for (; this.idx < this.len; ) {
        // this.idx = i;
        const ret = this.parseAttr();
        if (ret) {
          // i = this.idx;
          attributes.push(ret);
        } else {
          // i++;
          break;
        }
      }

      const attr: Record<string, string> = {};
      for (const item of attributes) {
        attr[item.name] = item.value;
      }

      const cnt = this.parseTagTextContent();

      this.visitor({
        group,
        attr,
        text: cnt.text,
      });

      if (this.input.substring(this.idx, this.idx + 4) === '</A>') {
        this.idx += 4;
      } else {
        throw new Error('E002');
      }
    } else {
      this.idx += 1;
    }
  }

  checkDoctype() {
    this.scanToChar('<');
    const start = this.idx;

    this.scanToChar('>');
    this.idx += 1;
    const end = this.idx;
    const cnt = this.input.substring(start, end);

    return cnt.toLowerCase() === '<!doctype netscape-bookmark-file-1>';
  }

  parse(input: string, visitor: VisitorFn) {
    this.len = input.length;
    this.input = input;
    this.idx = 0;
    this.visitor = visitor;

    if (!this.checkDoctype()) {
      throw new Error('E001');
    }

    for (; this.idx < this.len; ) {
      if (this.input[this.idx] === '<') {
        if (this.input.substring(this.idx, this.idx + 4) === '<DT>') {
          this.idx += 4;
          this.parseDt([]);
        } else if (this.input.substring(this.idx, this.idx + 4) === '<DL>') {
          this.idx += 4;
          this.parseDl([]);
        } else {
          this.idx++;
        }
      } else {
        this.idx++;
      }
    }
  }
}
