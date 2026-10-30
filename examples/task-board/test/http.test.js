// Integration tests of the HTTP layer. They do not need a database:
// only routes that never touch Prisma are exercised here.
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createServer({ logRequests: false });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('GET /health returns JSON', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('unknown route renders a 404 page', async () => {
  const res = await fetch(`${base}/does-not-exist`);
  assert.equal(res.status, 404);
  assert.match(await res.text(), /Page not found/);
});

test('wrong method returns 405', async () => {
  const res = await fetch(`${base}/health`, { method: 'DELETE', headers: { 'x-csrf-token': 't', cookie: 'csrf=t' } });
  assert.equal(res.status, 405);
});

test('security headers and CSRF cookie are set', async () => {
  const res = await fetch(`${base}/login`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.match(res.headers.get('set-cookie'), /csrf=[\w-]+; Path=\/; HttpOnly; SameSite=Lax/);
  assert.match(await res.text(), /name="_csrf" value="[\w-]+"/);
});

test('POST without CSRF token is rejected', async () => {
  const res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'email=a%40b.c&password=x',
  });
  assert.equal(res.status, 403);
});

test('protected page redirects anonymous users to /login', async () => {
  const res = await fetch(`${base}/boards`, { redirect: 'manual' });
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/login');
});

test('htmx requests get HX-Redirect instead of 303', async () => {
  const res = await fetch(`${base}/boards`, { headers: { 'HX-Request': 'true' } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('hx-redirect'), '/login');
});

test('static files are served with ETag and 304', async () => {
  const first = await fetch(`${base}/static/app.css`);
  assert.equal(first.status, 200);
  assert.match(first.headers.get('content-type'), /text\/css/);
  const etag = first.headers.get('etag');
  const second = await fetch(`${base}/static/app.css`, { headers: { 'if-none-match': etag } });
  assert.equal(second.status, 304);
});

test('path traversal is blocked', async () => {
  const res = await fetch(`${base}/static/..%2f..%2fpackage.json`);
  assert.equal(res.status, 403);
});

test('too large body returns 413', async () => {
  const res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'x='.padEnd(200_000, 'a'),
  });
  assert.equal(res.status, 413);
});
