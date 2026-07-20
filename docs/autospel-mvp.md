# Autospel MVP — technische notitie

## Wat behouden bleef

- De Speelhal, de bestaande quizbibliotheek en alle andere spellen blijven op hun huidige gedeelde motor draaien.
- De bestaande Dadaïstische kaartafbeelding van het autospel blijft de toegang in de Speelhal.
- Oude gegevens onder `quizkast-progress-v1` worden niet verwijderd of opnieuw geïnterpreteerd.
- De gedeelde kop, voettekst, typografie en basiskleuren van de website blijven behouden.

## Wat vervangen werd

De actieve route van **Wie zit er aan het stuur?** verwijst voortaan naar `speelhal/autospel.html`. De oude rangschikquiz blijft in de code aanwezig als veilige historische fallback, maar nieuwe bezoekers komen er niet meer in terecht. Ook een oude querylink wordt door de Speelhal naar de nieuwe route gestuurd.

## Bestanden en verantwoordelijkheden

- `speelhal/autospel.html`: vaste paginaschil, kruimelpad, voortgang en dynamische spelruimte.
- `css/steering-game.css`: visuele rit, stemaccenten, autozones, responsiviteit, focus en verminderde beweging.
- `js/steering-game.js`: centrale inhoud, status, opslag, validatie, schermrendering, auto en ritverslag.
- `speelhal.html`, `menslab.html` en `js/profile.js`: ingangen naar de nieuwe route.
- `js/mijn-spoor.js`, `js/menslab.js` en `js/site-shell.js`: hervatten, exporteren, importeren en gericht wissen van lokale spelgegevens.

## Gegevensmodel

De rit gebruikt één object met `version: 1`. Het bevat:

- `currentPhase` en `voiceIndex`;
- de drie velden van het kruispunt;
- vier stemmen met stabiele IDs `reflex`, `relationRadar`, `compass` en `storyMaker`;
- per stem herkenning, antwoord, bescherming, invloed, `currentPosition` en `trialPosition`;
- de luidste en gedragsbepalende stem;
- de twee stemmen en antwoorden van de Binnenraad;
- kleine stap en evaluatiemoment van de testrit;
- het laatste lokale bewaarmoment.

De zitplaatsen hebben stabiele IDs `driver`, `front`, `back` en `outside`. Huidige en tijdelijke plaatsen blijven afzonderlijk bewaard.

## Flow en rendering

De zeven fases staan centraal geconfigureerd. Iedere fase gebruikt dezelfde paginaschil, overgangskaart, voortgang en terug/verder-navigatie. Antwoorden worden bij iedere wijziging lokaal bewaard en opnieuw uit de status gerenderd.

`renderCarLayout({ positions, mode, title })` tekent uitsluitend wat ze uit de aangeleverde positiegegevens leest. De vragen kennen geen afbeelding of pixelcoördinaten. De huidige CSS-auto kan daardoor later door een SVG, illustratie of animatie worden vervangen zonder de inhoudelijke antwoorden te herschrijven.

## Opslag en oude ritten

- Nieuwe sleutel: `onwijze-steering-game-v1`.
- De pagina herstelt rechtstreeks naar de laatst bezochte fase.
- Alleen geldige fases, stem-IDs en zitplaats-IDs worden bij het lezen aanvaard.
- Tekstvelden worden begrensd voordat ze opnieuw worden gerenderd.
- Een oude autospelrit onder `quizkast-progress-v1` wordt alleen gedetecteerd. Ze wordt niet gemigreerd, overschreven of verwijderd.
- **Nieuw kruispunt** en **Mijn gegevens voor dit spel verwijderen** wissen alleen de nieuwe autospelsleutel.
- Mijn spoor kan de nieuwe rit hervatten, exporteren, importeren en samen met alle lokale sitegegevens wissen.

## Bewuste MVP-grenzen

Er is geen score, type, diagnose, automatische interpretatie, serveropslag, analytics op antwoorden of adviesmotor. De vier stemmen zijn tijdelijke perspectieven voor één situatie. De speler kan een stem niet herkennen, onzeker blijven en geen gedeeld doel zien.

## Bewaard voor fase 2

- drag-and-drop;
- rijkere auto-illustraties;
- geanimeerde passagiers;
- visuele routes en kruispunten;
- dynamische scèneachtergronden;
- optionele geluiden;
- extra stemmen;
- vergelijking met eerdere ritten;
- uitgebreidere vragen over luidheid, geloofwaardigheid en blinde vlekken.

## Controlelijst

Controleer bij toekomstige wijzigingen minstens: alle/geen/enkele stemmen herkend, minder dan twee stemmen, onbekende antwoorden, geen gedeeld doel, gelijke en verschillende luidste/bepalende stem, lege bestuurdersstoel, gedeelde zitplaatsen, aangepaste testrit, terugnavigatie, vernieuwen en hervatten, gericht wissen, lange tekst, toetsenbord, smal scherm en `prefers-reduced-motion`.
