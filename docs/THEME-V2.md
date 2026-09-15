# Dotyk Slov Theme v2

Cieľ novej architektúry je jednoduchý: Shoptet má v produkcii načítať iba jeden CSS a jeden JS bundle. Zdrojový kód môže zostať rozdelený podľa komponentov a stránok.

## Produkčný výstup

Po `npm run build`:

```text
dist/
  dotyk-slov.css
  dotyk-slov.js
  dotyk-slov.js.map
```

Produkčný Shoptet potom potrebuje iba:

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/dist/dotyk-slov.css?v=BUILD">
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/dist/dotyk-slov.js?v=BUILD"></script>
```

## Zdrojová štruktúra

```text
src/
  header/
    theme.css             # Bender CSS entrypoint
  footer/
    theme.js              # Bender JS entrypoint
  theme/
    main.js               # Vite JS entrypoint
    runtime/
      boot-flag.js
      theme-runtime.js
    styles/
      main.css
      legacy.css          # dočasný bridge
      foundation/
        tokens.css
        base.css
    legacy/
      legacy-js.js        # dočasný bridge
```

Nové komponenty patria postupne do:

```text
src/theme/components/
src/theme/pages/
```

Legacy bridge sa bude zmenšovať, až kým úplne nezmizne.

## Prvý setup na Windows

Po prepnutí na refactor branch:

```powershell
git checkout refactor/vite-theme
npm install
npm run build
```

`npm install` vytvorí nový `package-lock.json`. Ten potom commitneme.

## Lokálny vývoj cez Shoptet Bender

Oficiálny Bender vyžaduje Node 18+.

Jednorazová inštalácia:

```powershell
yarn global add git+https://github.com/shoptet/shoptet-bender.git
```

Repo obsahuje `config.json`, takže v koreňovom priečinku stačí:

```powershell
shp-bender
```

Bender otvorí proxy reálneho e-shopu `https://808782.myshoptet.com/`, odstráni naše produkčné include-y s textom `dotyk-slov-assets` a injektne lokálny build.

Bender používa rovnaký `src/` ako Vite. Jeho lokálny output má iné názvy než produkčný Vite output.

### Dôležité

Bender aj Vite zapisujú do `dist/`. Pred publikovaním po práci v Benderi vždy spusti:

```powershell
npm run build
```

## Deploy include-ov cez Shoptet API

Skript:

```text
tools/deploy-template-includes.mjs
```

Používa endpoint:

```text
POST https://api.myshoptet.com/api/template-include
```

Token nikdy nepatrí do frontendu ani do Gitu.

Najprv si vytvor lokálne premenné podľa `.env.example` alebo ich nastav v termináli.

Bezpečný test bez API volania:

```powershell
$env:SHOPTET_DRY_RUN="1"
npm run deploy:includes
```

Ostrý deploy:

```powershell
$env:SHOPTET_DRY_RUN="0"
$env:SHOPTET_PRIVATE_API_TOKEN="SEM_PATRI_TOKEN"
$env:SHOPTET_BUILD_VERSION="20260915-1"
npm run deploy:includes
```

Skript aktualizuje iba API snippets `common-header` a `common-footer`.

## Migračné pravidlo

Od v2 už nevytvárame ďalšie globálne override súbory typu `homepage-wip.css`, `brand-refresh.css` a podobne.

Každá časť má jedného vlastníka:

- farby, spacing, globálne tokeny → `styles/foundation/tokens.css`
- header → `components/header.*`
- search → `components/search.*`
- cart drawer → `components/cart-drawer.*`
- homepage → `pages/home.*`
- produkt → `pages/product.*`
- kategória → `pages/category.*`
- footer → `components/footer.*`

Kým komponent ešte nie je migrovaný, žije cez `legacy.css` / `legacy-js.js`.

## Produkčný prechod

Živý `main` ostáva nedotknutý, kým:

1. `npm run build` prejde bez chyby,
2. Bender verzia vizuálne sedí s dnešným webom,
3. otestujeme homepage, produkt, kategóriu, košík a mobile,
4. až potom zmeníme Shoptet include-y na dva nové bundle súbory.
