# Jurnal de modificări

Format SemVer (MAJOR.MINOR.PATCH).

## 2.3.3 — 2026-11-20

- fff-kit 1.8.1: când `localStorage`/`sessionStorage` aruncă sau lipsesc (cookie-uri și date de site blocate, WebView fără stocare, `<iframe sandbox>`), kitul pune în loc o stocare în memorie, iar pagina pornește în loc să se oprească; datele nu se păstrează după închiderea paginii
- fff-kit 1.8.1: ghidajul care mărește controalele mici la 44 px măsoară acum și lățimea corpului paginii și a părintelui, deci un rând de butoane nu mai poate ieși din ecran (grupul rămâne neatins când mărirea l-ar depăși)

## 2.3.2 — 2026-11-17

- Compatibilitate cu browsere mai vechi (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kitul 1.8.0 aduce stratul de compatibilitate (rezerve pentru API-urile care lipsesc în motoarele vechi), iar sintaxa JavaScript mai nouă decât ES2017 a fost înlocuită cu forme echivalente acolo unde exista; expresiile regulate noi și `import()` trec prin rezerve. Fără modificări de funcționalitate intenționate. Verificat cu parser ES2017 și într-un motor vechi simulat, nu pe dispozitive reale.

## 2.3.1 — 2026-11-15

- Nou: butoane de distribuire pe rețele sociale (vertical, pe marginea din stânga; fără scripturi externe, doar linkuri deschise la clic); bara de zoom cu lupă și „potrivire ecran” revine pe marginea din dreapta, centrată pe verticală; corectat afișarea suprapusă la zoom mare (panourile cu înălțimi în vh/vw nu mai ies din ecran).

## 2.3.0 — 2026-11-15

- Nou: accesibilitate pe toate ecranele — butonul „Aa” (mărimea textului, contrast ridicat, fără animații, text lizibil, linkuri subliniate, citire cu voce), săgeata „Înapoi sus” și „Sari la conținut”; fereastra se potrivește mereu ecranului; zoom-ul cu lupă și „potrivire ecran” stau acum pe marginea din stânga (fff-kit 1.6.0).

## 2.2.9 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.2.4 — 2026-11-08

- Nou: buton «Copiază linkul» lângă fiecare link de canal (direct, arhivă, index); copiază adresa fără a deschide nimic (cu rezervă existentă la eșec).

## 2.2.1 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.2.1 — 2026-11-02

### Surse actualizate (runda 2, verificat la 2026-11-02)
- Cardul „Oglinzi Nitter” (în toate cele 8 limbi): textul „la 11.10.2026 XCancel a revenit online” era depășit; XCancel s-a suspendat din nou pe 14 septembrie 2026 „până la o nouă notificare”, iar depozitul Nitter a fost arhivat (doar citire) pe 11 septembrie 2026 (TechCrunch, 15.09.2026). Canalul este marcat ca nefuncțional.

## 2.2.0 — 2026-10-27

Anterior: v2.1.0.

- Verificare documentată pentru archive.today (căutări web + citirea paginilor, 2026-10-27; fără acces direct la archive.* din mediu): (1) Wikipedia „Archive.today” listează domeniile archive.today, .fo, .is, .li, .md, .ph, .vn (+ adresă .onion) și relatează: citație FBI către registrar (30.10.2025), un raport AdGuard (nov. 2025), o pagină CAPTCHA modificată care ar fi trimis cereri repetate spre un blog (ian. 2026) și interzicerea legăturilor către serviciu de către Wikipedia în engleză (2026) invocând atacul DDoS și dovezi de modificare a conținutului arhivat; operatorul este anonim. (2) Wiki-ul Archive Team spune: fără API de trimitere, CAPTCHA frecvent (mai ales VPN/proxy/mobil), cotă limitată per IP, și documentează forma „https://archive.today/timegate/<url originală>” pentru ultima arhivă. (3) Forma `https://archive.ph/newest/<url>` folosită de aplicație NU apare în nicio sursă citită; rămâne neconfirmată (nu s-a schimbat, pentru că nici timegate nu s-a putut testa live).
- Nou: notă vizibilă lângă linkul archive.today, în 8 limbi, care spune acestea cu atribuire („potrivit articolului Wikipedia”) și că aplicația nu a verificat afirmațiile nici forma linkului. Apare doar după o scanare (când linkul e afișat).
- Test nou `tests/archnote.test.mjs` (12 verificări: ascunsă înainte de scanare, vizibilă după, și în starea de eroare, 7 limbi, nicio cerere automată către archive.*). Existente: `alternatives` 8/8, `evidence-sheet` 34/34.
- Textele noi: RO și EN scrise, fr/it/es/pt/de/hu traducere automată, neverificată nativ.
- Neimplementat: verificare live a disponibilității archive.today (ar contacta un terț, cere CAPTCHA); dovada că tiparul /newest/ funcționează; instanțe Nitter reale.

## 2.1.0 — 2026-10-27

Anterior: v2.0.0.

- Nou: link „Deschide în archive.today (alternativă)” lângă rezultatul Wayback (doar link, fără cerere automată).
- Nou: avertisment vizibil, în 8 limbi, că lista de instanțe Nitter nu este întreținută sau verificată și că instanțele primesc IP-ul și contul căutat.
- Documentație: secțiunea despre fiabilitate, linii Stare/Offline.
- De verificat: tiparul `archive.ph/newest/…` și disponibilitatea archive.today (nu au putut fi confirmate din mediul de dezvoltare).
