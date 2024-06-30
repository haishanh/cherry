import { test, expect } from 'vitest';

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

  const rows: string[][] = [];
  new SimpleCsvParser(input, (row) => {
    rows.push(row);
  }).parse();

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
  expect(rows).toEqual(expected);
});
