import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { html, raw, escapeHtml } from '../src/views/html.js';
import { Router, compose } from '../src/router.js';
import { hashPassword, verifyPassword } from '../src/lib/password.js';
import { validateTask, validateRegistration, parseId, parseTags } from '../src/validation.js';
import { parseCookies, serializeCookie } from '../src/context.js';
import { parseUrlEncoded } from '../src/middleware/body.js';

describe('html templating', () => {
  test('escapes interpolated values', () => {
    assert.equal(String(html`<p>${'<script>"x"&\''}</p>`), '<p>&lt;script&gt;&quot;x&quot;&amp;&#39;</p>');
  });
  test('does not double-escape nested templates and joins arrays', () => {
    const items = ['a', '<b>'].map((x) => html`<li>${x}</li>`);
    assert.equal(String(html`<ul>${items}</ul>`), '<ul><li>a</li><li>&lt;b&gt;</li></ul>');
  });
  test('skips null/false, keeps raw', () => {
    assert.equal(String(html`${null}${false}${undefined}${raw('<hr>')}${0}`), '<hr>0');
  });
  test('escapeHtml handles non-strings', () => {
    assert.equal(escapeHtml(undefined), '');
    assert.equal(escapeHtml(5), '5');
  });
});

describe('router & compose', () => {
  const ctxFor = (method, path) => ({ method, path, params: {}, throw(status, msg) { throw Object.assign(new Error(msg), { status }); } });

  test('matches params', async () => {
    const r = new Router();
    let seen;
    r.get('/boards/:id/tasks/:taskId', (ctx) => { seen = ctx.params; });
    await r.middleware()(ctxFor('GET', '/boards/3/tasks/9'), async () => {});
    assert.deepEqual(seen, { id: '3', taskId: '9' });
  });

  test('falls through to next when no path matches', async () => {
    const r = new Router().get('/a', () => {});
    let called = false;
    await r.middleware()(ctxFor('GET', '/b'), async () => { called = true; });
    assert.ok(called);
  });

  test('405 when path matches but method does not', async () => {
    const r = new Router().get('/a', () => {});
    await assert.rejects(r.middleware()(ctxFor('DELETE', '/a'), async () => {}), { status: 405 });
  });

  test('HEAD is served by GET routes', async () => {
    let hit = false;
    const r = new Router().get('/a', () => { hit = true; });
    await r.middleware()(ctxFor('HEAD', '/a'), async () => {});
    assert.ok(hit);
  });

  test('compose runs middleware in onion order', async () => {
    const log = [];
    const mw = (n) => async (ctx, next) => { log.push(`>${n}`); await next(); log.push(`<${n}`); };
    await compose([mw(1), mw(2)])({});
    assert.deepEqual(log, ['>1', '>2', '<2', '<1']);
  });

  test('compose rejects double next()', async () => {
    await assert.rejects(compose([async (c, next) => { await next(); await next(); }])({}), /multiple/);
  });
});

describe('passwords', () => {
  test('hash and verify', async () => {
    const h = await hashPassword('correct horse');
    assert.match(h, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    assert.equal(await verifyPassword('correct horse', h), true);
    assert.equal(await verifyPassword('wrong', h), false);
    assert.equal(await verifyPassword('x', 'garbage'), false);
  });
  test('same password gives different hashes (salt)', async () => {
    assert.notEqual(await hashPassword('a'), await hashPassword('a'));
  });
});

describe('validation', () => {
  test('task title required and trimmed', () => {
    assert.equal(validateTask({ title: '   ' }).errors.title, 'Title is required.');
    const r = validateTask({ title: '  Write  ', priority: 'HIGH' });
    assert.equal(r.ok, true);
    assert.equal(r.values.title, 'Write');
  });
  test('rejects unknown priority and bad tags', () => {
    const r = validateTask({ title: 'x', priority: 'URGENT', tags: 'ok, <bad>' });
    assert.ok(r.errors.priority);
    assert.ok(r.errors.tags);
  });
  test('registration rules', () => {
    const r = validateRegistration({ name: '', email: 'nope', password: 'short' });
    assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'password']);
  });
  test('parseId and parseTags', () => {
    assert.equal(parseId('12'), 12);
    assert.equal(parseId('1e3x'), null);
    assert.equal(parseId('-1'), null);
    assert.deepEqual(parseTags('Work, home, work,'), ['work', 'home']);
  });
});

describe('http helpers', () => {
  test('cookie parse/serialize', () => {
    assert.deepEqual(parseCookies('a=1; b=hello%20world; bad'), { a: '1', b: 'hello world' });
    assert.equal(serializeCookie('sid', 'x', { maxAge: 10 }), 'sid=x; Path=/; Max-Age=10; HttpOnly; SameSite=Lax');
  });
  test('urlencoded with repeated keys', () => {
    assert.deepEqual(parseUrlEncoded('title=Buy+milk&tag=a&tag=b'), { title: 'Buy milk', tag: ['a', 'b'] });
  });
});
