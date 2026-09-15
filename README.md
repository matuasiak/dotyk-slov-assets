# Dotyk Slov — Shoptet theme

Custom storefront pre `808782.myshoptet.com`.

## Theme v2

Nová architektúra je pripravená na branchi `refactor/vite-theme`.

Cieľ:

```text
Shoptet
  ↓
1× CSS: dist/dotyk-slov.css
1× JS:  dist/dotyk-slov.js
  ↓
Vite source rozdelený na komponenty a stránky
```

Živý `main` zatiaľ stále používa pôvodné samostatné CSS/JS súbory, takže refactor neovplyvňuje produkciu.

## Príkazy

```bash
npm install
npm run build
npm run preview
```

Legacy build zostal dostupný iba ako fallback:

```bash
npm run legacy:setup
npm run legacy:build
npm run legacy:verify
```

## Lokálny Shoptet development

Repo je pripravené pre Shoptet Bender. Po jeho globálnej inštalácii stačí z koreňa projektu:

```bash
shp-bender
```

Bender používa `config.json`, reálny sandbox `808782.myshoptet.com` a naše entrypointy:

```text
src/header/theme.css
src/footer/theme.js
```

## Source of truth

```text
src/theme/
  main.js
  runtime/
  styles/
    foundation/
      tokens.css
      base.css
    main.css
    legacy.css
  legacy/
    legacy-js.js
```

`legacy.css` a `legacy-js.js` sú dočasný most zo súčasného webu. Každý komponent sa bude migrovať do novej štruktúry a potom sa z bridge odstráni.

Už nevytvárame nové globálne override vrstvy typu `brand-refresh.css` alebo `homepage-wip.css`.

## Shoptet API deployment

`tools/deploy-template-includes.mjs` vie cez Private API nastaviť produkčné include-y na jediný CSS a JS bundle.

Bezpečný dry-run:

```bash
SHOPTET_DRY_RUN=1 npm run deploy:includes
```

Private API token sa nikdy neukladá do repozitára ani do frontend kódu.

## Dokumentácia

Detailný workflow a migračné pravidlá sú v [`docs/THEME-V2.md`](docs/THEME-V2.md).
