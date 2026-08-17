# Dotyk Slov – Shoptet téma

Tento repozitár obsahuje úpravy vzhľadu testovacieho e-shopu `808782.myshoptet.com`.

## Ktoré súbory sú správne

Aktívne a ďalej upravované sú iba tieto štyri súbory:

| Časť webu | CSS | JavaScript |
| --- | --- | --- |
| Hlavička | [`css/header.css`](css/header.css) | [`js/header.js`](js/header.js) |
| Hlavné bannery | [`css/banners.css`](css/banners.css) | [`js/banners.js`](js/banners.js) |

Pri ďalších úpravách nevytvárame súbory `v2`, `v3` a podobne. Mení sa vždy iba príslušný súbor z tabuľky. Históriu verzií uchováva Git.

## Linky pre Shoptet

Do sekcie **Vzhľad a obsah → Editor → HTML kód → Záhlavie (HEAD)** patria:

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/header.css?v=1">
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/banners.css?v=1">
```

Do sekcie **Zápatí (pred koncom BODY)** patria:

```html
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/header.js?v=1"></script>
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/banners.js?v=1"></script>
```

Parameter `?v=1` slúži iba na obnovenie cache. Pri väčšej publikovanej úprave ho môžeme zvýšiť na `?v=2`; názvy súborov zostávajú rovnaké.

## Pravidlo pre ďalšiu prácu

- úprava hlavičky: `css/header.css` a podľa potreby `js/header.js`;
- úprava bannerov: `css/banners.css` a podľa potreby `js/banners.js`;
- obrázky: priečinok `images/`;
- fonty Shoptetu: priečinok `fonts/`.

Staré verziované súbory zostávajú dočasne iba preto, že ich ešte načítava ostrý Shoptet. Po prepnutí HTML odkazov na štyri kanonické súbory ich odstránime.
