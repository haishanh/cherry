import { test, expect } from 'vitest';

import { Parser as SimpleCsvParser, ParserError } from './SimpleCsvParser.util';

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

test('escaped quotes, empty trailing cells, and CR-only records', () => {
  const rows: string[][] = [];
  new SimpleCsvParser('a,b,c\r"He said ""hello""",,\r', (row) => rows.push(row)).parse();
  expect(rows).toEqual([
    ['a', 'b', 'c'],
    ['He said "hello"', '', ''],
  ]);
});

test('rejects malformed quotes and optionally limits columns', () => {
  expect(() => new SimpleCsvParser('"unclosed', () => {}).parse()).toThrow(ParserError);
  expect(() => new SimpleCsvParser('"closed"oops', () => {}).parse()).toThrow(ParserError);
  expect(() => new SimpleCsvParser('a,b,c', () => {}, 2).parse()).toThrow(ParserError);
});
