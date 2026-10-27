// Teste v2.2.0: nota despre archive.today (atribuită Wikipedia, neverificată de aplicație) apare doar odată cu linkul, în 8 limbi.
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
const vis = () => p.evaluate(() => { const e = document.getElementById('archNote'); return !!e && !e.hidden && e.textContent.length > 40; });
t('nota archive.today este ascunsă înainte de o scanare', !(await vis()));
mode = 'ok'; await scan('jack');
t('după scanare: nota este vizibilă (ro) și spune că afirmațiile nu sunt verificate', await vis() && /Wikipedia/.test(await p.textContent('#archNote')) && /Nu am verificat/.test(await p.textContent('#archNote')));
mode = 'fail'; await scan('jack');
t('și în starea de eroare nota rămâne vizibilă', await vis());
for (const [l, probe] of [['en', /We have not verified/], ['fr', /Nous n’avons vérifié/], ['it', /Non abbiamo verificato/], ['es', /No hemos verificado/], ['pt', /Não verificámos/], ['de', /nicht überprüft/], ['hu', /nem ellenőriztük/]]) {
  await p.click('.langbtn[data-lang=' + l + ']'); await p.waitForTimeout(200);
  t('nota tradusă (' + l + ')', probe.test(await p.textContent('#archNote')) && /archive\.today/i.test(await p.textContent('#archNote')) && /2026/.test(await p.textContent('#archNote')));
}
t('nicio cerere automată către gazde archive.*', ![...hosts].some((h) => /archive\.(ph|today|is|md|vn|fo|li)$/.test(h)), [...hosts]);
t('fără pageerror/CSP', errs.length === 0, errs);
await b.close();
console.log('\n' + ok + ' ok, ' + bad + ' eșuate');
process.exit(bad ? 1 : 0);
