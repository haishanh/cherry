import { test, expect } from 'vitest';

import * as faviconLib from './favicon.util';

test('links with sizes attr', () => {
  const html = `
  <html><head>
    <link rel="icon" href="/1.png" sizes="48x48">
    <link rel="icon" href="/2.png" sizes="96x96">
    <link rel="icon" href="/3.png" sizes="128x128">
  </head></html>
`;
  const ret = faviconLib.findFaviconInHtml(html, 'test.com');
  expect(ret).toEqual({ href: '/2.png', type: undefined });
});

test('links with sizes attr2', () => {
  const html = `
  <html><head>
    <link rel="shortcut icon" href="1" type="image/x-icon">
    <link rel="icon" href="2" sizes="32x32">
    <link rel="icon" href="3" sizes="48x48">
    <link rel="icon" href="4" sizes="96x96">
    <link rel="icon" href="5" sizes="144x144">
  </head></html>
`;
  const ret = faviconLib.findFaviconInHtml(html, 'test.com');
  expect(ret).toEqual({ href: '4', type: undefined });
});

test('www.yahoo.com', () => {
  const html = `
  <html><head>
    <link rel="icon" sizes="any" mask href="1.svg">
    <link rel="shortcut icon" href="1.ico" />
  </head></html>
`;
  const ret = faviconLib.findFaviconInHtml(html, 'test.com');
  expect(ret).toEqual({ href: '1.ico', type: undefined });
});

test('developer.chrome.com', () => {
  const html = `
  <html><head>
    <link href=/1.png rel=apple-touch-icon sizes=180x180>
    <link href=/2.png rel=icon sizes=32x32 type=image/png>
    <link href=/3.png rel=icon sizes=16x16 type=image/png>
  </head></html>
`;
  const ret = faviconLib.findFaviconInHtml(html, 'test.com');
  expect(ret).toEqual({ href: '/1.png', type: undefined });
});

test('open.spotify.com', () => {
  const html = `
  <html><head>
  <link rel="icon" sizes="32x32" type="image/png" href="f32.png"/><link rel="icon" sizes="16x16" type="image/png" href="f16.png"/><link rel="icon" href="f.ico"/>
  </head></html>
`;
  const ret = faviconLib.findFaviconInHtml(html, 'test.com');
  expect(ret).toEqual({ href: 'f32.png', type: 'image/png' });
});
