# Dotyk Slov — Shoptet DS9.2

Editovateľná editorial commerce vrstva pre Shoptet Classic.

- [Vizuálny editor šablóny](https://dotyk-slov-template-admin.matuasiak.chatgpt.site)
- [Návod: čo sa upravuje v Shoptete a čo v editore](SHOPTET-TEMPLATE.md)
- Produkty, ceny, sklad, doprava a objednávky zostávajú natívne v Shoptete.
- `src/` obsahuje jednu izolovanú DS9 vrstvu; `css/` a `js/` sú publikované release súbory.

Nasadené súbory:

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/dotyk-slov.css?v=9.2.0">
<script src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.config.js?v=9.2.0"></script>
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.js?v=9.2.0"></script>
```

Release sa skladá príkazom `node tools/build.mjs`.
