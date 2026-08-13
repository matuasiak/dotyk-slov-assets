# Dotyk Slov — Shoptet Blank

Čistá téma pre testovací e-shop `808782.myshoptet.com`.

## Ako je postavená

- základom je aktuálny Shoptet Classic (`templates-assets/11`), pretože Blank vychádza z Classic;
- oficiálne Shoptet zdroje sa sťahujú do `.vendor/` a nikdy sa neupravujú;
- všetky naše zmeny sú iba v `src/`;
- build vytvorí `css/dotyk-slov.css` a `js/dotyk-slov.js`;
- testovací Shoptet má momentálne vypnuté iba natívne CSS, preto používame natívny Shoptet JavaScript a nepridávame jeho druhú kópiu.

## Lokálny build

```bash
npm install
npm run setup
npm run verify
```

## Testovací Shoptet

V hlavičke:

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/dotyk-slov.css?v=1.0.0">
```

Pred koncom `body`:

```html
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.js?v=1.0.0"></script>
```

Produkčný e-shop `dotykslov.sk` sa týmto repozitárom nemení.

