# Dotyk Slov DS9.2 — návod k šablóne

DS9.2 je jedna čistá prezentačná vrstva nad oficiálnym základom Shoptet Classic. Produkty, ceny, sklad, varianty, doprava ani objednávky sa nekopírujú do vlastného kódu. Shoptet zostáva jediným zdrojom pravdy pre obchod a samostatný editor spravuje iba obsahovú a vizuálnu vrstvu.

## Čo sa upravuje kde

| Obsah | Miesto úpravy | Poznámka |
| --- | --- | --- |
| Produkty na titulnej strane | Shoptet → Produkty → Titulná strana | Téma z natívnych skupín vytvorí prepínateľné kolekcie a ukáže najviac 8 produktov. |
| Cena, sklad, varianty | Detail produktu v Shoptete | Nikde sa neduplikujú. |
| Hlavný banner | Shoptet → Vzhľad a obsah → Bannery | Prvý banner titulnej strany má prednosť pred záložným hero obrázkom. |
| Výhody pod hero sekciou | Shoptet → Vzhľad a obsah → Bannery → Výhody | Téma ponechá natívny obsah a upraví iba vzhľad. |
| Navigácia a kategórie obchodu | Shoptet → Vzhľad a obsah → Menu | Hlavička používa natívne Shoptet menu. |
| Súvisiace a podobné produkty | Konkrétny produkt v Shoptete | Zobrazia sa ako prirodzené odporúčania na detaile. |
| Hranica dopravy zdarma | Nastavenie dopravy v Shoptete | Košík používa natívny výpočet. |
| Texty, farby, nálady, obrázky a vlastné sekcie | Editor DS9.2 | Zmena sa uloží jedným tlačidlom a web ju načíta automaticky. |

## Bežný postup bez programovania

1. Otvor [editor šablóny Dotyk Slov](https://dotyk-slov-template-admin.matuasiak.chatgpt.site).
2. Vyber sekciu v ľavom menu.
3. Uprav text, farbu, odkaz alebo nahraj obrázok.
4. Skontroluj živý náhľad.
5. Klikni **Uložiť zmeny**.

Každé uloženie vytvorí samostatnú verziu. V časti **História** sa dá starší stav obnoviť bez zásahu do kódu.

## Kód vložený v Shoptete

```html
<link rel="stylesheet" href="https://matuasiak.github.io/dotyk-slov-assets/css/dotyk-slov.css?v=9.2.0">
<script src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.config.js?v=9.2.0"></script>
<script defer src="https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.js?v=9.2.0"></script>
```

Hlavný JavaScript si najprv vyžiada uloženú konfiguráciu z editora. Statický `dotyk-slov.config.js` zostáva ako bezpečná záloha, takže dočasná nedostupnosť editora nerozbije e-shop. Nevkladaj súčasne staré v6/v8 súbory.

## Conversion journey

DS9.2 používa konverzné princípy bez agresívnych popupov:

- na detaile produktu: istoty pri nákupe a natívne súvisiace produkty,
- v košíku: natívny progres k doprave zdarma, dôvera a nenásilný odkaz na doplnky,
- po nákupe: značkový obsah a prirodzená cesta k ďalším náladám.

Recenzie, produktové balíčky a darčeky sa zapínajú až vtedy, keď sú v Shoptete reálne nakonfigurované. Téma nevytvára falošné ponuky ani ceny.

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

Ak sa nový release nepodarí, v Shoptete zmeň `?v=9.2.0` späť na poslednú overenú verziu. Produkty, objednávky a sklad tým nie sú dotknuté, pretože DS9 mení iba prezentačnú vrstvu.
