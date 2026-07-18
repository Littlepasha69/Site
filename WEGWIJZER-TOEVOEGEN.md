# Iets toevoegen aan De Wegwijzer

Alle vermeldingen staan in `js/wegwijzer-data.js`. De pagina, zoekfunctie en categorieknoppen worden daarna automatisch opgebouwd.

## Een nieuwe vermelding

1. Open `js/wegwijzer-data.js`.
2. Kopieer het volledige voorbeeldblok tussen `{` en `}`.
3. Plak het onder het vorige blok en zet een komma tussen beide blokken.
4. Vervang de voorbeeldtekst door jouw eigen informatie.
5. Zet `published: true` wanneer de kaart zichtbaar mag zijn.

## De velden

- `title`: naam van het boek, de maker, organisatie, plek of website.
- `category`: de grote groep. De pagina maakt hiervoor automatisch een filterknop.
- `kind`: bijvoorbeeld Boek, Podcast, Website, Praktijk, Product of Plek.
- `lens`: bijvoorbeeld Onderzoek, Praktijk, Ervaring, Filosofie of Zingeving.
- `description`: wat kan iemand hier vinden?
- `why`: waarom geef jij dit een plek in De Wegwijzer?
- `tags`: korte zoekwoorden tussen aanhalingstekens.
- `location`: bijvoorbeeld België, Nederland, Online of Antwerpen.
- `image`: optioneel pad naar een foto in de map `images`, bijvoorbeeld `images/mijn-boek.jpg`. Laat leeg voor een kaart zonder foto.
- `imageAlt`: een korte beschrijving van de foto. Laat leeg wanneer de foto alleen versiering is.
- `url`: de volledige webpagina waar de bezoeker naartoe gaat.
- `linkLabel`: de tekst van de knop, bijvoorbeeld `Bekijk het boek` of `Bezoek de website`.
- `relationship`: `independent`, `affiliate` of `partner`.
- `featured`: zet op `true` om de kaart extra groot en als eerste te tonen.

Gebruik `independent` voor eigen vondsten zonder financiële afspraak. Verander dit alleen naar `affiliate` of `partner` wanneer er werkelijk een commerciële relatie bestaat.
