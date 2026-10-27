# Jurnal de modificări

Format SemVer (MAJOR.MINOR.PATCH).

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
