// Teste v2.1.0: fișa de probă (amprentă SHA-256, verificare, istoric local, export).
import {createRequire as __fffCR} from 'node:module';
import {readFileSync as __fffRF} from 'node:fs';
import {createRequire} from 'module';
import {createHash} from 'node:crypto';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __fffAxe = () => process.env.FFF_AXE || process.env.AXE_PATH || (() => { try { return __fffCR(import.meta.url).resolve('axe-core/axe.min.js'); } catch { return undefined; } })();
const APP = JSON.parse(__fffRF(new URL('../app.json', import.meta.url), 'utf8'));
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '..', 'index.html');
const AXE = __fffAxe();
let ok = 0, bad = 0;
function t(name, cond, extra) { if (cond) { ok++; console.log('  ok  ' + name); } else { bad++; console.log('  FAIL ' + name + (extra ? ' :: ' + extra : '')); } }
const sha = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox']});
const SNAP = {archived_snapshots: {closest: {available: true, url: 'http://web.archive.org/web/20250101000000/https://x.com/jack', timestamp: '20250101000000'}}};

async function open(w, h, opts = {}) {
  const ctx = opts.ctx || await b.newContext({viewport: {width: w, height: h}, locale: 'ro-RO', acceptDownloads: true, ...(opts.bypass ? {bypassCSP: true} : {})});
  const hosts = new Set();
  await ctx.route(/^https?:/, (r) => {
    const u = new URL(r.request().url()); hosts.add(u.hostname);
    if (u.hostname === 'archive.org' && !opts.fail) return r.fulfill({status: 200, contentType: 'application/json', headers: {'access-control-allow-origin': '*'}, body: JSON.stringify(opts.empty ? {archived_snapshots: {}} : SNAP)});
    if (u.hostname === 'archive.org') return r.abort();
    return r.fulfill({status: 200, contentType: 'text/html', body: '<!doctype html><title>s</title>'});
  });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__clip = []; Object.defineProperty(navigator, 'clipboard', {value: {writeText: (x) => { window.__clip.push(x); return Promise.resolve(); }}, configurable: true}); });
  await p.goto(FILE); await p.waitForTimeout(600);
  return {ctx, p, errs, hosts};
}
const scan = async (p, v) => { await p.fill('#handleInput', v); await p.click('#txtScanBtn'); await p.waitForFunction(() => document.querySelector('#sheetText').textContent.length > 50); await p.waitForTimeout(500); };
const sheetText = (p) => p.textContent('#sheetText');

{
  const {ctx, p, errs, hosts} = await open(1280, 900);
  console.log('Pornire');
  t('versiune ' + APP.version, await p.evaluate((v) => document.querySelector('meta[name=application-version]').content === v, APP.version));
  t('fișa ascunsă înainte de scanare', await p.isHidden('#sheet'));

  console.log('Fișă pentru profil');
  await scan(p, '@jack');
  const txt = await sheetText(p);
  t('fișa este vizibilă', await p.isVisible('#sheet'));
  t('titlul în română + versiunea', txt.startsWith('FIȘĂ DE PROBĂ — X fără cont · v' + APP.version));
  t('link canonic x.com/jack', txt.includes('Link canonic: https://x.com/jack\n'));
  const lfp = txt.match(/Amprentă link \(SHA-256\): ([0-9a-f]{64})/);
  t('amprenta linkului = SHA-256(link canonic)', !!lfp && lfp[1] === sha('https://x.com/jack'));
  const mk = txt.match(/^#SHA256-REPORT ([0-9a-f]{64})\n$/m);
  const body = txt.slice(0, mk.index);
  t('ultima linie = amprenta fișei și corespunde textului', !!mk && mk[1] === sha(body) && txt.endsWith(mk[0]));
  t('data UTC ISO în fișă', /Generată \(UTC\): \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ/.test(txt));
  t('instantaneu Wayback inclus și normalizat la https', txt.includes('Instantaneu: https://web.archive.org/web/20250101000000/https://x.com/jack') && txt.includes('Data instantaneului: 01 ian 2025'));
  t('căi: Wayback, archive.today, Google, Bing, DuckDuckGo, Nitter', ['web.archive.org/web/*/https://x.com/jack', 'archive.ph/newest/https://x.com/jack', 'google.com/search?q=', 'bing.com/search?q=', 'duckduckgo.com/?q=', 'nitter/wiki/Instances'].every((x) => txt.includes(x)));

  console.log('Fișă pentru postare (normalizare twitter.com)');
  await scan(p, 'https://mobile.twitter.com/jack/status/1700000000000000000?s=20');
  const t2 = await sheetText(p);
  t('normalizat la x.com/…/status/…', t2.includes('Link canonic: https://x.com/jack/status/1700000000000000000\n') && t2.includes('Link alternativ: https://twitter.com/jack/status/1700000000000000000'));
  t('mențiune „Normalizat de la”', /Normalizat de la: https:\/\/mobile\.twitter\.com\/jack\/status\/1700000000000000000\?s=20 → /.test(t2));
  t('data postării din ID', /Data postării din ID \(UTC\): 20\d\d-\d\d-\d\d \d\d:\d\d:\d\d UTC/.test(t2));
  t('fișele diferă (amprentă)', t2.match(/#SHA256-REPORT (\w+)/)[1] !== mk[1]);

  console.log('Verificare');
  await p.click('#verifyBox summary');
  await p.fill('#verifyInput', txt); await p.click('#verifyBtn'); await p.waitForTimeout(200);
  t('fișă intactă → corespunde', /corespunde: textul nu a fost modificat/.test(await p.textContent('#verifyRes')) && await p.locator('#verifyRes.ok').count() === 1);
  await p.fill('#verifyInput', txt.replace('Link canonic: https://x.com/jack', 'Link canonic: https://x.com/jacq')); await p.click('#verifyBtn'); await p.waitForTimeout(200);
  t('fișă modificată → NU corespunde', /NU corespunde/.test(await p.textContent('#verifyRes')) && await p.locator('#verifyRes.bad').count() === 1);
  await p.fill('#verifyInput', txt.replace(/\n/g, '\r\n')); await p.click('#verifyBtn'); await p.waitForTimeout(200);
  t('capete de linie CRLF tolerate', await p.locator('#verifyRes.ok').count() === 1);
  await p.fill('#verifyInput', 'text oarecare'); await p.click('#verifyBtn'); await p.waitForTimeout(200);
  t('fără linie de amprentă → mesaj', /#SHA256-REPORT/.test(await p.textContent('#verifyRes')));

  console.log('Copiere, descărcare, istoric');
  await p.click('#sheetCopy'); await p.waitForTimeout(100);
  t('copiere: textul fișei în clipboard', (await p.evaluate(() => window.__clip.pop())) === t2);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#sheetDl')]);
  t('descărcare .txt cu nume pe handle', /^fisa-proba-jack-1700000000000000000-\d{8}T\d{6}Z\.txt$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  t('istoric inițial gol', await p.locator('#histList li').count() === 0 && !(await p.getAttribute('#histEmpty', 'hidden') !== null));
  await p.click('#sheetSave'); await p.waitForTimeout(100);
  await scan(p, '@jack'); await p.click('#sheetSave'); await p.waitForTimeout(100);
  t('2 fișe în istoric', await p.locator('#histList li').count() === 2);
  const lk = await p.evaluate(() => Object.keys(localStorage)); t('cheie de stocare cu prefix', lk.includes("x-fara-cont.history"), lk.join(','));
  await p.reload(); await p.waitForTimeout(500);
  t('istoricul persistă după reîncărcare', await p.locator('#histList li').count() === 2);
  await p.click('#histBox summary');
  await p.locator('#histList li').first().locator('button[data-act=copy]').click(); await p.waitForTimeout(100);
  t('copiere din istoric', /#SHA256-REPORT [0-9a-f]{64}/.test(await p.evaluate(() => window.__clip.pop())));
  await p.locator('#histList li').first().locator('button[data-act=reopen]').click(); await p.waitForTimeout(600);
  t('„Reia” rescanează profilul', (await sheetText(p)).includes('Link canonic: https://x.com/jack'));
  await p.locator('#histList li').first().locator('button[data-act=del]').click(); await p.waitForTimeout(100);
  t('ștergere individuală', await p.locator('#histList li').count() === 1);
  await p.click('#histClear'); await p.waitForTimeout(100);
  t('ștergere totală', await p.locator('#histList li').count() === 0 && await p.evaluate(() => (JSON.parse(localStorage.getItem('x-fara-cont.history') || '[]')).length === 0));

  console.log('Limbă');
  await p.click('.langbtn[data-lang=en]'); await p.waitForTimeout(500);
  const te = await sheetText(p);
  t('limba EN → fișa în engleză, amprentă încă validă', te.startsWith('EVIDENCE SHEET') && te.match(/#SHA256-REPORT (\w+)/)[1] === sha(te.slice(0, te.match(/^#SHA256-REPORT/m).index)));
  t('rețea: doar archive.org / web.archive.org', [...hosts].every((h) => /(^|\.)archive\.org$/.test(h)), [...hosts].join(','));
  t('fără pageerror', errs.length === 0, errs.join('|'));
  await ctx.close();
}
console.log('Arhivă lipsă / eroare');
{
  const {ctx, p} = await open(1280, 900, {empty: true});
  await scan(p, '@nobody');
  const tx = await sheetText(p);
  t('nicio arhivă → mențiune în fișă', tx.includes('Arhivă Wayback: nicio arhivă găsită') && !tx.includes('Instantaneu:'));
  await ctx.close();
  const f = await open(1280, 900, {fail: true});
  await scan(f.p, '@nobody');
  t('eroare de rețea → mențiune în fișă', (await sheetText(f.p)).includes('verificare eșuată'));
  await f.ctx.close();
}
console.log('Accesibilitate și mobil');
if (AXE) {
  const {ctx, p} = await open(1280, 900, {bypass: true});
  await scan(p, '@jack'); await p.click('#verifyBox summary'); await p.click('#histBox summary'); await p.click('#sheetSave');
  await p.addScriptTag({content: fs.readFileSync(AXE, 'utf8')});
  const v = await p.evaluate(async () => (await axe.run(document)).violations.map((x) => x.id + ':' + x.nodes.length));
  t('axe 0 violări cu fișa deschisă', v.length === 0, v.join(','));
  await ctx.close();
}
{
  const {ctx, p} = await open(390, 800);
  await scan(p, '@jack');
  t('fără defilare orizontală la 390px', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await ctx.close();
}
await b.close();
console.log(`\n${ok} ok, ${bad} eșuate`);
process.exit(bad ? 1 : 0);
