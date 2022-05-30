import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { Parser as NetscapeBookmarkFile1Parser } from './nbf1Parser.util';

const html0 = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="0" LAST_MODIFIED="1" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
    <DL><p>
        <DT><A HREF="chrome://bookmarks/" ADD_DATE="0" ICON="">|</A>
        <DT><A HREF="https://google.com">test</A>
        <DT><H3 ADD_DATE="1438854071" LAST_MODIFIED="1648220723">in</H3>
        <DL><p>
            <DT><A HREF="">hello aFrOD</A>
        </DL><p>
        <DT><H3 ADD_DATE="0" LAST_MODIFIED="1">🐝</H3>
        <DL><p>
            <DT><H3 ADD_DATE="1" LAST_MODIFIED="1">🏞 jpeg</H3>
            <DL><p>
                <DT><A HREF="asdd">9TB5S</A>
            </DL><p>
            <DT><A>a| -b </A>
            <DT><A>1.2</A>
        </DL><p>
        <DT><H3 ADD_DATE="0" LAST_MODIFIED="1">n</H3>
        <DL><p>
            <DT><A HREF="" ADD_DATE="0" ICON="">asdf</A>
        </DL><p>
        <DT><A HREF="" ADD_DATE="0">1EREe IHGlp</A>
        <DT><H3 ADD_DATE="0">ABI7s</H3>
        <DL><p>
            <DT><A HREF="" ADD_DATE="0" ICON="">wxfapiao</A>
        </DL><p>
        <DT><A HREF="" ADD_DATE="0" ICON=""></A>
        <DT><H3 ADD_DATE="0" LAST_MODIFIED="1">+</H3>
        <DL><p>
            <DT><A HREF="" ADD_DATE="0" ICON="">(123)d</A>
            <DT><A>aa</A>
        </DL><p>
        <DT><A></A>
        <DT><H3 ADD_DATE="0" LAST_MODIFIED="1590253617">to</H3>
        <DL><p>
        <DT><A HREF="asdf">fmGwO</A>
        <DT><A HREF="xcc" ICON="">p5_nX</A>
    </DL><p>
    <DT><A HREF="abc&#?001" ADD_DATE="0" ICON="">poJV3</A>
    <DT><A HREF="001" ADD_DATE="1">60e-s</A>
</DL><p>
`;

function parseAsOb(html: string) {
  const map = new Map();
  new NetscapeBookmarkFile1Parser().parse(html, (b) => {
    if (map.has(b.group)) {
      map.get(b.group).push(b);
    } else {
      map.set(b.group, [b]);
    }
  });

  const o = {};
  for (const e of map.entries()) {
    const key = e[0].join(':');
    o[key] = e[1];
  }
  return o;
}

test('NetscapeBookmarkFile1Parser 01', () => {
  const o = parseAsOb(html0);

  const expected = {
    'Bookmarks Bar': [
      { group: ['Bookmarks Bar'], attr: { HREF: 'chrome://bookmarks/', ADD_DATE: '0', ICON: '' }, text: '|' },
      { group: ['Bookmarks Bar'], attr: { HREF: 'https://google.com' }, text: 'test' },
      { group: ['Bookmarks Bar'], attr: { HREF: '', ADD_DATE: '0' }, text: '1EREe IHGlp' },
      { group: ['Bookmarks Bar'], attr: { HREF: '', ADD_DATE: '0', ICON: '' }, text: '' },
      { group: ['Bookmarks Bar'], attr: {}, text: '' },
      { group: ['Bookmarks Bar'], attr: { HREF: 'abc&#?001', ADD_DATE: '0', ICON: '' }, text: 'poJV3' },
      { group: ['Bookmarks Bar'], attr: { HREF: '001', ADD_DATE: '1' }, text: '60e-s' },
    ],
    'Bookmarks Bar:in': [{ group: ['Bookmarks Bar', 'in'], attr: { HREF: '' }, text: 'hello aFrOD' }],
    'Bookmarks Bar:🐝:🏞 jpeg': [{ group: ['Bookmarks Bar', '🐝', '🏞 jpeg'], attr: { HREF: 'asdd' }, text: '9TB5S' }],
    'Bookmarks Bar:🐝': [
      { group: ['Bookmarks Bar', '🐝'], attr: {}, text: 'a| -b ' },
      { group: ['Bookmarks Bar', '🐝'], attr: {}, text: '1.2' },
    ],
    'Bookmarks Bar:n': [{ group: ['Bookmarks Bar', 'n'], attr: { HREF: '', ADD_DATE: '0', ICON: '' }, text: 'asdf' }],
    'Bookmarks Bar:ABI7s': [
      { group: ['Bookmarks Bar', 'ABI7s'], attr: { HREF: '', ADD_DATE: '0', ICON: '' }, text: 'wxfapiao' },
    ],
    'Bookmarks Bar:+': [
      { group: ['Bookmarks Bar', '+'], attr: { HREF: '', ADD_DATE: '0', ICON: '' }, text: '(123)d' },
      { group: ['Bookmarks Bar', '+'], attr: {}, text: 'aa' },
    ],
    'Bookmarks Bar:to': [
      { group: ['Bookmarks Bar', 'to'], attr: { HREF: 'asdf' }, text: 'fmGwO' },
      { group: ['Bookmarks Bar', 'to'], attr: { HREF: 'xcc', ICON: '' }, text: 'p5_nX' },
    ],
  };
  assert.equal(o, expected);
});

test('safari export', () => {
  const html0 = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
	<HTML>
	<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
	<Title>Bookmarks</Title>
	<H1>Bookmarks</H1>
	<DT><H3 FOLDED>Favorites</H3>
	<DL><p>
		<DT><A HREF="abc">01 02</A>
	</DL><p>
	<DT><H3 FOLDED>Bookmarks Menu</H3>
	<DL><p>
	</DL><p>
	<DT><A HREF="https://example.com">a</A>
</HTML>
`;

  const o = parseAsOb(html0);
  assert.equal(o, {
    Favorites: [{ group: ['Favorites'], attr: { HREF: 'abc' }, text: '01 02' }],
    '': [{ group: [], attr: { HREF: 'https://example.com' }, text: 'a' }],
  });
});

test.run();
