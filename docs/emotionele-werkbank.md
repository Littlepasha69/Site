# Spoel even terug — technische en inhoudelijke notitie

## Doel

`Spoel even terug` is de tweede versie van de Emotionele Werkbank. De bezoeker legt één recent en veilig te bekijken moment achteraf op een denkbeeldige montagetafel. De oefening maakt onderdelen naast elkaar zichtbaar zonder een oorzaak, diagnose, score of juiste interpretatie te produceren.

De filmmetafoor is uitsluitend een interface: frames, ondertiteling, takes, montagepunten, een golf en een premièrekaart. Er wordt geen video gemaakt en er worden geen antwoorden naar een server gestuurd.

## Acht haltes

1. De scène — drie waarneembare filmframes; alleen het kantelpunt is verplicht.
2. De ondertiteling — wat de bezoeker dacht, vreesde of besloot dat de frames betekenden.
3. De binnenkant — de eerst bewust opgemerkte ervaring en lichaamssignalen.
4. De golf — vijf intensiteitsmomenten, voorlopige emotienamen en een eventuele tweede emotie.
5. Wat stond er op het spel? — mogelijke inzet en wat misschien dichterbij kwam.
6. Twee takes — eerste impuls, werkelijk gedrag en wat niet veilig of haalbaar was.
7. De montage — wat de golf veranderde en waar zij eindigde.
8. Een andere montage — een optionele tegenlezing en een klein mogelijk experiment.

Na de acht haltes verschijnt `De première — De anatomie van jouw scène`. Die kaart gebruikt alleen werkelijk ingevulde antwoorden.

## Psychologische begrenzing

De structuur is geïnformeerd door proces- en appraisalbenaderingen van emotie: situatie, betekenisverlening, bewuste ervaring, lichaam, actietendens en gedrag kunnen samenhangen, maar vormen geen universele vaste volgorde. Een emotienaam blijft een voorlopige werktitel en een impuls is geen uitgevoerde handeling. De oefening kiest niet tussen concurrerende emotietheorieën en presenteert zelfrapportage niet als volledige biologische reconstructie.

De centrale formuleringen blijven daarom lokaal en voorlopig: `In dit ene moment beschreef je…`, `Dit leek toen…` en `Een andere lezing blijft mogelijk…`. De code genereert geen psychologische verklaring.

Inhoudelijke achtergrond: Scherer & Moors, *The Emotion Process: Event Appraisal and Component Differentiation*, Annual Review of Psychology 2019; daarnaast het Atlasdossier Emotieregulatie en `ATLAS-REDACTIE.md`.

## Veiligheid

- De opening vraagt expliciet om een recent, ongemakkelijk maar nu veilig te bekijken moment.
- `Stoppen voor nu` blijft op laptop in de vaste route en staat ook bovenaan.
- Stoppen bewaart eerst het lokale concept en opent een rustige uitweg.
- Haltes 2 tot en met 8 kunnen worden overgeslagen.
- Onzekerheid is een geldig antwoord; lege antwoorden worden nooit automatisch aangevuld.
- Een alternatieve lezing mag schadelijk of grensoverschrijdend gedrag niet vergoelijken.
- Professionele of acute hulp wordt alleen genoemd wanneer klachten, zelfbeschadiging, gevaar of onveiligheid dat relevanter maken dan verder zelfonderzoek.

## Datamodel en opslagversie 2

Concepten blijven onder de bestaande sleutel `menslab-exercise-drafts-v1` staan. Het item `emotionele-routekaart` bevat nu:

```text
{
  version: 2,
  values: { ...alle formulierwaarden },
  updatedAt: ISO-datum
}
```

Afgeronde kaarten blijven in de bestaande `labSnapshots`-lijst van `menslab-progress-v3`. Een nieuwe kaart bevat onder meer:

```text
{
  kind: "emotion-scene",
  version: 2,
  privacyMode: "full" | "without-scene" | "experiment-only",
  title,
  turningPoint,
  emotionNames,
  impulse,
  actualAction,
  waveEnd,
  experimentalShot,
  data,
  savedAt
}
```

Bij `without-scene` wordt `sceneMoment` niet in `data` opgenomen. Bij `experiment-only` worden uitsluitend de titel en het experimentele shot bewaard. `Niets bewaren` verwijdert het Werkbank-concept en voegt geen kaart toe.

## Mijn spoor en oude gegevens

Mijn spoor toont v2-kaarten in een eigen onderdeel met datum, titel, kantelpunt, emotienamen, impuls, werkelijk gedrag, einde van de golf en experimenteel shot. De knop `Volledige kaart bekijken` opent dezelfde Werkbank met de opgeslagen kaart via `?kaart=<savedAt>#premiere`. Verwijderen haalt alleen het gekozen item uit `labSnapshots`.

Oude items met `kind: "exercise"` worden niet gemigreerd of gewist. Mijn spoor toont hun oude samenvatting, observatie en volgende stap wanneer aanwezig, plus veilige fallbacks wanneer velden ontbreken. Oude conceptvelden die niet meer bestaan worden genegeerd; bruikbare gelijknamige velden blijven behouden.

## Optionele antwoorden

Alle antwoorden zijn optioneel behalve `frameTurn`, het waarneembare kantelpunt. Ook de titel, scènebeschrijving, frames ervoor en erna, ondertiteling, lichaamssignalen, golf, emotienamen, inzet, takes, niet-gedraaide scène, veranderingen, tegenlezing en experiment mogen leeg blijven.

## Veilig uitbreiden

- Voeg nieuwe velden alleen met een unieke `name` toe; de generieke serializer neemt ze dan lokaal mee.
- Wijzig bestaande veldnamen alleen met een expliciete, geteste migratie.
- Houd `version: 2` leesbaar zolang bestaande kaarten in browsers kunnen staan; verhoog de versie bij een incompatibele wijziging.
- Bouw eindkaarten met DOM-elementen en `textContent`, niet met onbetrouwbare vrije tekst in HTML.
- Voeg geen automatische interpretatie, score, diagnose of serveropslag toe zonder een nieuwe inhoudelijke en privacybeoordeling.
- Test steeds volledig, minimaal, overgeslagen, lange tekst, alle vier bewaarmodi, heropenen, verwijderen, oude data, toetsenbord, gsm en reduced motion.
