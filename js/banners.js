DOTYK SLOV – BANNERY V3 / EDITORIAL GRID

Toto je úplne nová verzia bez slidera.

1. Vymaž celý CSS kód bannerov V2.
2. Vlož celý obsah súboru dotyk-slov-bannery-v3-editorial.css.
3. Vymaž celý JavaScript bannerov V2.
4. Do JavaScriptu vlož celý obsah TXT súboru
   dotyk-slov-bannery-v3-editorial-JS.txt.

Starý a nový JavaScript nenechávaj vložený naraz.

Výsledok na desktopoch:
- prvé dva bannery 945 × 672 budú vedľa seba,
- ďalšie tri široké bannery budú v páse pod nimi,
- všetky bannery sú priamo klikateľné,
- žiadne šípky slidera, progress ani dragovanie.

Na mobile sa bannery posúvajú prirodzene prstom. Kód nemení header ani search.

MOBILE-FIRST NASTAVENIE

Mobilná verzia používa natívne potiahnutie prstom. Jeden banner má šírku 88 %
obrazovky, takže používateľ vidí aj začiatok ďalšieho banneru. Nie sú potrebné
žiadne JS šípky ani automatické prehrávanie.

Pre každý široký desktopový banner vytvor v Shoptete samostatnú mobilnú verziu:
- odporúčaný rozmer 800 × 665 px,
- mobilnú verziu nastav na zobrazenie iba na mobile,
- pôvodnú širokú verziu nastav na zobrazenie iba na desktope,
- obe verzie môžu mať rovnakú Cieľovú URL a Text odkazu.

Kým široký banner nemá mobilnú verziu, kód ho na mobile radšej skryje, aby sa
nezobrazoval ako nečitateľný orezaný pás.

CTA ZO SHOPTETU

Pri úprave konkrétneho banneru v Shoptet administrácii vyplň:
- Text odkazu = text CTA tlačidla, napr. „Kúpiť“ alebo „Objaviť“,
- Cieľová URL = stránka, na ktorú vedie celý banner.

Názov banneru a Text banneru sa v tomto čistom vizuále nezobrazujú. Ak Text
odkazu necháš prázdny, banner zostane bez tlačidla a ukáže sa na ňom iba malá
šípka. Text CTA ani odkaz sa nepíšu do JavaScriptu.
