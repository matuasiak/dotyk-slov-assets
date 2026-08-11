# Dotyk Slov DS9 — návod k šablóne

DS9 je jedna čistá prezentačná vrstva nad oficiálnym základom Shoptet Classic. Neobsahuje ručne prepísané produkty, ceny, sklad ani výpočet dopravy. Tieto údaje zostávajú v Shoptete ako jedinom zdroji pravdy.

## Čo sa upravuje kde

| Obsah | Miesto úpravy | Poznámka |
| --- | --- | --- |
| Produkty na titulnej strane | Shoptet → Produkty → Titulná strana | Téma premiestni a naštýluje natívne skupiny Novinky, Limitky a Najpredávanejšie. |
| Cena, sklad, varianty | Detail produktu v Shoptete | Nikde sa neduplikujú. |
| Hero obrázok | Shoptet → Vzhľad a obsah → Bannery | Používa sa prvý banner titulnej strany. |
| Výhody pod hero sekciou | Shoptet → Vzhľad a obsah → Bannery → Výhody | Téma ponechá natívny obsah a zmení iba vzhľad. |
| Navigácia a kategórie obchodu | Shoptet → Vzhľad a obsah → Menu | Hlavička používa natívne Shoptet menu. |
| Súvisiace a podobné produkty | Konkrétny produkt v Shoptete | Zobrazia sa ako prirodzené odporúčania na detaile. |
| Hranica dopravy zdarma | Nastavenie dopravy v Shoptete | Košík používa natívny Shoptet výpočet a progress bar. |
| Texty, farby, nálady a vlastné sekcie | `/admin/` editor DS9 | Editor vytvorí iba bezpečný `dotyk-slov.config.js`. |

## Bežný postup bez programovania

1. Otvor editor na `https://matuasiak.github.io/dotyk-slov-assets/admin/`.
2. Uprav texty, farby, odkazy alebo obrázky. Koncept sa priebežne ukladá v prehliadači.
3. Klikni na **Stiahnuť config.js**.
4. Nahraď súbor `js/dotyk-slov.config.js` na hostingu. Web ho načíta automaticky; CSS ani hlavný JavaScript sa nemenia.

Alternatíva pre Shoptet návrhára: skopíruj vygenerovanú konfiguráciu do sekcie s vlastným HTML/JavaScriptom pred externý `dotyk-slov.js`.

## Kód vložený v Shoptete

Používaj stabilné adresy. Konfigurácia je voliteľná ako samostatný tag, pretože hlavný skript si ju vie načítať aj sám.

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/dotyk-slov.css?v=9">
<script src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.config.js?v=9"></script>
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.js?v=9"></script>
```

Pri ďalšom release stačí zvýšiť číslo za `?v=`. Nevkladaj súčasne staré v6/v8 súbory.

## Conversion journey

DS9 používa princípy vhodné pre Dotyk Slov bez agresívnych popupov:

- na detaile produktu: istoty pri nákupe a natívne súvisiace produkty,
- v košíku: natívny progress k doprave zdarma, dôvera a nenásilný odkaz na doplnky,
- po nákupe: značkový obsah a prirodzená cesta k ďalším náladám.

Recenzie, produktové balíčky a darčeky sa majú zapínať až vtedy, keď sú v Shoptete reálne nakonfigurované. Téma nevytvára falošné ponuky ani ceny.

## Technická údržba

Zdrojové súbory sú v `src/`. Release sa vytvára príkazom:

```bash
node tools/build.mjs
```

Kontrola pred publikovaním:

```bash
node --check src/dotyk-slov.js
node --check src/dotyk-slov.config.js
```

Release CSS sa vždy skladá z čistého Shoptet Classic základu a presne jednej DS9 vrstvy. Staré triedy `ds-clean-theme` a `ds8-theme` sa nesmú znovu aktivovať.

## Bezpečný návrat

Ak sa release nepodarí, v Shoptete zmeň `?v=9` späť na poslednú overenú verziu. Produkty, objednávky a sklad tým nie sú dotknuté, pretože DS9 mení iba prezentačnú vrstvu.
