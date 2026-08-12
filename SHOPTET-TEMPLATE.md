# Dotyk Slov 10 — postupná téma nad Classic

Blank template v Shoptete je založený na HTML šablóny Classic. Cieľom tejto témy preto nie je vytvoriť druhý web nad Shoptetom, ale upravovať pôvodné sub-elementy a zachovať ich triedy, udalosti a napojenia doplnkov.

## Čo zostáva natívne v Shoptete

| Časť | Správa |
| --- | --- |
| Produkty, ceny, sklad a varianty | Shoptet → Produkty |
| Produkty na titulnej strane | Shoptet → Produkty → Titulná strana |
| Hero obrázky | Shoptet → Bannery → Carousel |
| Výhody | Shoptet → Bannery → Výhody |
| Navigácia a kategórie | Shoptet → Menu a kategórie |
| Galéria, košík, objednávka, recenzie a doplnky | Natívny Classic runtime |

Vlastná vrstva natívne uzly nepresúva. Pridá im iba pomocnú triedu a zmení vzhľad. Samostatné editorial sekcie sú vložené ako oddelené bloky a možno ich celé vypnúť.

## Jednoduché nastavenia

V `dotyk-slov.config.js` je blok `features`. Každá voľba je `true` alebo `false`:

```js
features: {
  announcement: true,
  stickyHeader: true,
  heroOverlay: true,
  quickCategories: true,
  productTabs: true,
  editorialSections: true,
  productAssurances: true,
  cartConfidence: true,
  footerBrand: true,
  postPurchase: true,
}
```

Texty, odkazy a farby sú v rovnakom konfiguračnom súbore. Produkty, ceny ani sklad sa doň nikdy nepíšu.

## Poradie ďalšieho vývoja

1. Stabilizovať hlavičku a produktový detail na desktope aj mobile.
2. Doladiť natívne produktové karty a skupiny na homepage.
3. Skontrolovať kategóriu, vyhľadávanie, košík a objednávku.
4. Až potom pridávať nové samostatné komponenty ako UGC galéria alebo shop-the-look.

Každý nový komponent musí fungovať aj po vypnutí a nesmie meniť poradie natívnych obchodných uzlov.
