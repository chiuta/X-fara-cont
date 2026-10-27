// Teste v2.1.0: alternativă archive.today (doar link, nicio cerere automată) și avertismentul despre lista Nitter.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) { ok++; console.log('  ok  ' + n); } else { bad++; console.log('  FAIL ' + n + (x ? ' :: ' + JSON.stringify(x) : '')); } };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const SNAP = {archived_snapshots: {closest: {available: true, url: 'http://web.archive.org/web/20250101000000/https://x.com/jack', timestamp: '20250101000000'}}};
const ctx = await b.newContext({locale: 'ro-RO'});
const hosts = new Set(); let mode = 'ok';
await ctx.route(/^https?:/, (r) => {
  const u = new URL(r.request().url()); hosts.add(u.hostname);
  if (u.hostname === 'archive.org') return mode === 'fail' ? r.abort() : r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(mode === 'empty' ? {archived_snapshots: {}} : SNAP)});
  return r.fulfill({status: 200, contentType: 'text/html', body: '<!doctype html><title>s</title>'});
});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) errs.push(m.text()); });
await p.goto(FILE); await p.waitForTimeout(600);
const scan = async (v) => { await p.fill('#handleInput', v); await p.click('#txtScanBtn'); await p.waitForTimeout(1200); };
const links = () => p.evaluate(() => [...document.querySelectorAll('#archiveActions a')].map((a) => a.href));
t('avertisment Nitter vizibil din start (ro)', /nu este întreținută/.test(await p.textContent('#nitterNote')) && /nu afirmăm/.test(await p.textContent('#nitterNote')));
for (const m of ['ok', 'empty', 'fail']) {
  mode = m; await scan('jack');
  const l = await links();
  t('link archive.today în starea „' + m + '”', l.includes('https://archive.ph/newest/https://x.com/jack'), l);
}
mode = 'ok'; await scan('https://x.com/jack/status/20');
t('postare: link archive.today cu /status/', (await links()).includes('https://archive.ph/newest/https://x.com/jack/status/20'), await links());
t('niciodată o cerere automată către archive.ph/archive.today', ![...hosts].some((h) => /archive\.(ph|today|is|md|vn|fo|li)$/.test(h)), [...hosts]);
await p.click('.langbtn[data-lang=en]');
await p.waitForTimeout(300);
t('textele se traduc (en)', /not maintained or verified/.test(await p.textContent('#nitterNote')) && (await p.textContent('#archiveActions')).includes('archive.today'));
t('fără pageerror/CSP', errs.length === 0, errs);
await b.close();
console.log('\n' + ok + ' ok, ' + bad + ' eșuate');
process.exit(bad ? 1 : 0);
