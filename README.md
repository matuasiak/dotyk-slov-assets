# Dotyk Slov — Shoptet Classic custom theme

Postupná vizuálna vrstva nad oficiálnym základom Shoptet Classic v Blank template režime.

- Classic CSS a JavaScript zabezpečujú produkty, varianty, košík, objednávku a doplnky.
- `src/dotyk-slov.css` upravuje iba vybrané sub-elementy pôvodnej šablóny.
- `src/dotyk-slov.js` pridáva samostatné obsahové bloky a značkuje natívne prvky; nepresúva hlavičku, produktové skupiny ani detail produktu do vlastného DOM.
- Bežné voľby sú v `src/dotyk-slov.config.js` podobne ako v šablóne Apollo.

## Nasadenie na testovací Shoptet

Do `HEAD`:

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/dotyk-slov.css?v=11.0.0">
```

Do konca `BODY`, v tomto poradí:

```html
<script src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.config.js?v=11.0.0"></script>
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.js?v=11.0.0"></script>
```

Nevkladať súčasne staré DS8/DS9 súbory. Produkčný e-shop sa touto revíziou nemení.

## Vývoj

```bash
node --check src/dotyk-slov.js
node tools/check-progressive.mjs
node tools/build.mjs
```

Build zachová kompletný Shoptet Classic CSS balík a nahradí iba vlastnú Dotyk Slov vrstvu.
