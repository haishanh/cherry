import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { Parser as SimpleCsvParser } from './SimpleCsvParser.util';

test('basic', () => {
  const input = `folder,url,  title  ,description,tags,created
"Folder 
hello",http://google.com,Google,Search engine,"search, app",1629980125
'Folder/Nested folder',http://yahoo.com,Yahoo,Another search engine,"search, app",1629980125
Folder/Nested folder   ,http://yahoo.com,Yahoo,Another search engine,"search, app",1629980125

Folder/"Nested" folder,http://yahoo.com,Yahoo,Another search engine,"search, app",1629980125
Folder/Nested folder   ,    http://yahoo.com,Yahoo,   Another search engine,"search, app",1629980125


`;

  const rows = [];
  new SimpleCsvParser().parse(input, (row) => {
    rows.push(row);
  });

  const expected = [
    ['folder', 'url', '  title  ', 'description', 'tags', 'created'],
    ['Folder \nhello', 'http://google.com', 'Google', 'Search engine', 'search, app', '1629980125'],
    ["'Folder/Nested folder'", 'http://yahoo.com', 'Yahoo', 'Another search engine', 'search, app', '1629980125'],
    ['Folder/Nested folder   ', 'http://yahoo.com', 'Yahoo', 'Another search engine', 'search, app', '1629980125'],
    ['Folder/"Nested" folder', 'http://yahoo.com', 'Yahoo', 'Another search engine', 'search, app', '1629980125'],
    [
      'Folder/Nested folder   ',
      '    http://yahoo.com',
      'Yahoo',
      '   Another search engine',
      'search, app',
      '1629980125',
    ],
  ];
  assert.equal(rows, expected);
});

test.run();
