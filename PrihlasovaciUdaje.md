# Přihlašovací údaje pro testovací uživatele

## Administrátor (POUZE PRO VLASTNÍKA SYSTÉMU)
- **Uživatelské jméno:** Administrator
- **Heslo:** MojeNoveHeslo123
- **Role:** Administrátor systému (Správce)
- **Popis:** Má přístup ke všem společnostem, uživatelům a nastavením v systému. Může vytvářet a spravovat firemní účty. Tento účet je vyhrazen pouze pro hlavního administrátora systému.
- **URL:** `/admin`

## Firemní Admin/Vlastník
- **Uživatelské jméno:** firma
- **Heslo:** firma123
- **Role:** Firemní administrátor
- **Popis:** Vlastník nebo hlavní administrátor konkrétní společnosti. Má přístup ke správě společnosti, uživatelů a dalších nastavení v rámci své firmy.
- **URL:** `/firma`

## Manažer
- **Uživatelské jméno:** manager
- **Heslo:** manager123
- **Role:** Manažer týmu
- **Popis:** Má přístup k řízení týmu operátorů a správě klientů. Může přidělovat operátorům úkoly a sledovat jejich výkon.
- **URL:** `/manager`

## Operátor
- **Uživatelské jméno:** operator
- **Heslo:** operator123
- **Role:** Telefonní operátor
- **Popis:** Základní uživatel, který vidí pouze klienty přidělené k volání. Může zaznamenávat výsledky hovorů, vytvářet záznamy a poznámky.
- **URL:** `/operator`

---

## Způsob nasazení testovacích dat:

Spuštění seedovacího skriptu pro vytvoření všech testovacích uživatelů, rolí a klientů. Skript vytvoří následující data:

1. 1 administrátorský účet
2. 1 testovací společnost "Ukázková Firma s.r.o."
3. 1 firemní admin účet
4. 1 manažerský účet
5. 1 operátorský účet
6. 1 testovací tým "Obchodní tým"
7. Statusy klientů (Nový, Kontaktován, Zájem, Nezájem, Smlouva)
8. Výsledky hovorů (Uskutečněn, Nezastižen, Odmítl, Zájem, Nezájem)
9. Testovací klienty (3 ukázkoví klienti s různými statusy)

Pro nasazení testovacích dat je třeba provést:
1. Spustit aplikaci
2. Importovat data pomocí seedovacího skriptu (v produkci by toto nebylo dostupné)