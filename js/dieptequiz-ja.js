(function () {
  const trackStorageKey = 'menslab-progress-v3';
  const previousTrackStorageKey = 'menslab-progress-v2';
  const questions = [
    {
      id: 'first-pull', phase: 'Lens 1 · Wat in jou beweegt', eyebrow: 'De eerste beweging',
      text: 'Wat kwam er als eerste in je op toen deze ja verscheen?', help: 'Kies wat bij dit ene moment het dichtst in de buurt komt.',
      options: [
        ['Ik voelde merkbare zin of nieuwsgierigheid.', { inner_instemming: 3, space_available: 1 }, 'Je eerste beweging bevatte merkbare zin of nieuwsgierigheid.'],
        ['Ik voelde: dit is belangrijk, ook al wordt het niet gemakkelijk.', { inner_values: 3, rel_care: 1 }, 'Je antwoord droeg al vroeg een gevoel van betekenis of waarde.'],
        ['Ik dacht vooral aan teleurstelling, schuld of wat men van mij zou vinden.', { inner_pressure: 3, rel_harmony: 2 }, 'De mogelijke reactie van anderen was al vroeg aanwezig.'],
        ['Ik hoorde mezelf eigenlijk al ja zeggen.', { inner_automatic: 3 }, 'Je ja leek sneller te vertrekken dan je bewuste afweging.'],
        ['Ik kon nog niet goed voelen wat ik zelf wilde.', { inner_uncertain: 3, space_uncertain: 1 }, 'Je eigen voorkeur was op dat moment nog niet helder.']
      ]
    },
    {
      id: 'answer-now', phase: 'Lens 1 · Wat in jou beweegt', eyebrow: 'Als je opnieuw mocht antwoorden',
      text: 'Welke mogelijkheid past vandaag het best?', help: 'Een voorwaardelijke ja is ook een echt antwoord.',
      options: [
        ['Ik zou opnieuw ongeveer dezelfde ja geven.', { inner_instemming: 2, inner_values: 1, space_available: 1 }, 'Ook met wat afstand blijft je ja grotendeels overeind.'],
        ['Ik zou ja zeggen, maar kleiner of onder duidelijke voorwaarden.', { space_negotiate: 3, space_capacity: 1 }, 'Je ja lijkt voorwaarden of een kleinere omvang nodig te hebben.'],
        ['Ik zou nu eerder nee zeggen.', { space_capacity: 2, inner_instemming: 1 }, 'Met afstand verschuift je antwoord eerder richting nee.'],
        ['Ik heb meer tijd of informatie nodig.', { inner_uncertain: 2, space_uncertain: 3 }, 'Je keuze lijkt nog informatie of tijd nodig te hebben.'],
        ['Ik ervaar niet dat ik werkelijk kan kiezen.', { rel_power: 3, space_constrained: 3 }, 'Je ervaart de keuzevrijheid zelf als beperkt.']
      ]
    },
    {
      id: 'body', phase: 'Lens 1 · Wat in jou beweegt', eyebrow: 'Het lichaam als getuige, niet als rechter',
      text: 'Wat merkte je rond deze ja het duidelijkst in je lichaam?', help: 'Een lichaamssignaal is informatie, geen bewijs van een verborgen waarheid.',
      options: [
        ['Energie, ruimte of beweging naar voren.', { inner_instemming: 2, space_available: 1 }, 'Je lichaamssignaal voelde eerder ruim of energiek.'],
        ['Rust of stevigheid, ook zonder enthousiasme.', { inner_values: 2, rel_care: 1 }, 'Je lichaamssignaal voelde eerder rustig of gedragen.'],
        ['Spanning, zwaarte of terugdeinzen.', { space_capacity: 2, inner_pressure: 1 }, 'Je lichaam gaf spanning, zwaarte of terughoudendheid aan.'],
        ['Bijna niets; ik was vooral bezig met antwoorden of doorgaan.', { inner_automatic: 2, inner_uncertain: 1 }, 'Er was weinig ruimte om lichamelijke signalen op te merken.'],
        ['Tegenstrijdige signalen.', { inner_uncertain: 2, space_negotiate: 1 }, 'Je lichaamssignalen wezen niet allemaal dezelfde kant op.']
      ]
    },
    {
      id: 'reason', phase: 'Lens 1 · Wat in jou beweegt', eyebrow: 'De reden onder het antwoord',
      text: 'Welke zin komt het dichtst bij waarom je ja zei of overweegt?', help: '',
      options: [
        ['“Ik wil dit werkelijk meemaken of doen.”', { inner_instemming: 3 }, 'Je reden bevat eigen verlangen of belangstelling.'],
        ['“Ik vind dit belangrijk en wil ervoor staan.”', { inner_values: 3, rel_care: 1 }, 'Je reden is verbonden met iets wat je bewust belangrijk vindt.'],
        ['“Anders ben ik egoïstisch, lastig of niet goed genoeg.”', { inner_pressure: 3, rel_harmony: 1 }, 'Je ja raakt aan zelfbeoordeling, schuld of goedkeuring.'],
        ['“Ik wil spanning, conflict of teleurstelling voorkomen.”', { rel_harmony: 3, inner_pressure: 1 }, 'Je ja helpt mogelijk spanning of teleurstelling voorkomen.'],
        ['“Ik weet eigenlijk niet precies waarom.”', { inner_automatic: 2, inner_uncertain: 2 }, 'De reden achter je ja is nog moeilijk te benoemen.']
      ]
    },
    {
      id: 'cost-no', phase: 'Lens 2 · Wat met jou meebeslist', eyebrow: 'De prijs van een nee',
      text: 'Wat zou een nee in de werkelijke wereld waarschijnlijk kosten?', help: 'Denk aan emotionele, relationele, praktische én materiële gevolgen.',
      options: [
        ['Weinig; de ander of de situatie kan dit goed dragen.', { rel_light: 3, space_available: 2 }, 'Een nee lijkt in deze situatie relatief draaglijk.'],
        ['Teleurstelling of ongemak, maar waarschijnlijk geen breuk.', { rel_harmony: 2, space_negotiate: 1 }, 'Een nee zou waarschijnlijk teleurstelling of ongemak geven.'],
        ['Een ernstig conflict, verlies van vertrouwen of relationele verwijdering.', { rel_harmony: 3, space_constrained: 2 }, 'Een nee lijkt een betekenisvolle relationele prijs te hebben.'],
        ['Mogelijk nadeel voor mijn veiligheid, inkomen, wonen, zorg of positie.', { rel_power: 4, space_constrained: 4 }, 'Een nee kan materiële, positionele of veiligheidsgevolgen hebben.'],
        ['Dat kan ik moeilijk inschatten.', { rel_power: 1, space_uncertain: 2 }, 'De gevolgen van een nee zijn voor jou nog onvoldoende voorspelbaar.']
      ]
    },
    {
      id: 'care', phase: 'Lens 2 · Wat met jou meebeslist', eyebrow: 'Zorg en wederkerigheid',
      text: 'Welke rol speelt zorg voor de ander in jouw ja?', help: 'Zorgen voor iemand is niet automatisch jezelf verliezen.',
      options: [
        ['We helpen en dragen elkaar over en weer.', { rel_reciprocity: 3, rel_care: 1 }, 'Je ja staat in een ervaring van wederkerigheid.'],
        ['Ik kies bewust om deze persoon of verantwoordelijkheid te dragen.', { rel_care: 3, inner_values: 1 }, 'Zorg is hier een bewuste en betekenisvolle reden.'],
        ['Het voelt vooral als wat van mij verwacht wordt.', { rel_harmony: 2, inner_pressure: 2 }, 'Verwachting weegt merkbaar mee in je antwoord.'],
        ['Ik draag vaker dan de ander, en dat begint te wegen.', { rel_power: 2, space_capacity: 3 }, 'De verdeling van zorg of inspanning voelt niet helemaal evenwichtig.'],
        ['Zorg voor een ander speelt hier nauwelijks mee.', { rel_light: 2, inner_instemming: 1 }, 'Deze ja lijkt maar beperkt door zorg voor een ander gevormd.']
      ]
    },
    {
      id: 'words-no', phase: 'Lens 2 · Wat met jou meebeslist', eyebrow: 'De taal van weigeren',
      text: 'Hoe beschikbaar zijn de woorden voor een vriendelijke nee?', help: 'Weten dat je mag weigeren is iets anders dan op het moment zelf woorden vinden.',
      options: [
        ['Ik kan vrij duidelijk en veilig weigeren.', { rel_light: 2, space_available: 3 }, 'Je beschikt over woorden en ruimte om te weigeren.'],
        ['Ik kan het, maar het kost me veel ongemak.', { rel_harmony: 2, space_negotiate: 1 }, 'Een nee is mogelijk, maar emotioneel niet kosteloos.'],
        ['Ik heb vooral tijd of een concrete zin nodig.', { space_negotiate: 3, inner_automatic: 1 }, 'Meer tijd of een bruikbare weigerzin kan verschil maken.'],
        ['Een nee voelt in deze verhouding niet echt veilig of mogelijk.', { rel_power: 4, space_constrained: 4 }, 'De verhouding laat een nee niet vanzelfsprekend toe.'],
        ['Ik weet het niet; ik heb het eigenlijk nooit geprobeerd.', { inner_uncertain: 1, space_uncertain: 2 }, 'Je weet nog niet hoeveel ruimte een nee werkelijk zou krijgen.']
      ]
    },
    {
      id: 'norm', phase: 'Lens 2 · Wat met jou meebeslist', eyebrow: 'De wereld waarin je leerde kiezen',
      text: 'Welke boodschap over een “goede” keuze herken je het meest?', help: 'Familie, cultuur en omgeving kunnen verschillende vormen van mens-zijn waardevol maken.',
      options: [
        ['“Een goede keuze is vooral trouw aan jezelf.”', { inner_instemming: 2, rel_light: 1 }, 'Trouw zijn aan jezelf is een belangrijke norm in je keuze.'],
        ['“Een goede keuze houdt rekening met wie op je rekent.”', { rel_care: 3, inner_values: 1 }, 'Rekening houden met verbondenheid is een belangrijke norm.'],
        ['“Een goede keuze bewaart de vrede en stelt niet teleur.”', { rel_harmony: 3, inner_pressure: 1 }, 'Harmonie bewaren klinkt mee als norm.'],
        ['“Een goede keuze doet wat nodig is, ook ten koste van jezelf.”', { inner_pressure: 2, rel_power: 1, space_capacity: 1 }, 'Plicht en zelfopoffering klinken mee als norm.'],
        ['Ik heb nooit zo over de achtergrond van mijn keuzes nagedacht.', { inner_uncertain: 2, space_uncertain: 1 }, 'De aangeleerde norm achter je keuze is nog onverkend.']
      ]
    },
    {
      id: 'no-cost', phase: 'Lens 3 · Hoeveel ruimte er werkelijk is', eyebrow: 'De onverwachte deur',
      text: 'Stel dat niemand teleurgesteld, boos, gekwetst of benadeeld raakt door jouw nee. Wat gebeurt er dan met je antwoord?', help: 'Dit hypothetische antwoord is niet je “ware zelf”. Het maakt alleen het krachtenveld zichtbaarder.',
      options: [
        ['Mijn ja blijft ongeveer hetzelfde.', { inner_instemming: 2, inner_values: 1, space_available: 1 }, 'Zelfs zonder sociale of praktische prijs blijft je ja grotendeels bestaan.', 'same'],
        ['Dan zou ik waarschijnlijk nee zeggen.', { rel_harmony: 2, inner_pressure: 2, space_constrained: 1 }, 'Wanneer de prijs van nee verdwijnt, verschuift je antwoord richting nee.', 'no'],
        ['Dan zou ik een kleinere of voorwaardelijke ja kiezen.', { space_negotiate: 3, space_capacity: 1 }, 'Zonder de volle druk ontstaat behoefte aan een kleinere of voorwaardelijke ja.', 'conditional'],
        ['Dan weet ik het nog altijd niet.', { inner_uncertain: 2, space_uncertain: 3 }, 'Ook zonder mogelijke gevolgen is je eigen antwoord nog niet helder.', 'unknown']
      ]
    },
    {
      id: 'more-room', phase: 'Lens 3 · Hoeveel ruimte er werkelijk is', eyebrow: 'Draagkracht is ook informatie',
      text: 'Wat zou er veranderen als je dubbel zoveel tijd, energie of praktische steun had?', help: '',
      options: [
        ['Dan zou mijn ja ruimer en enthousiaster worden.', { space_capacity: 3, inner_instemming: 1 }, 'Meer draagkracht zou je ja duidelijk ruimer maken.'],
        ['Ook dan zou ik liever nee zeggen.', { inner_instemming: 1, space_constrained: 1 }, 'Meer draagkracht verandert je voorkeur waarschijnlijk niet.'],
        ['Dan kan ik ja zeggen, maar nog steeds alleen onder voorwaarden.', { space_negotiate: 3, space_capacity: 1 }, 'Ook met meer steun blijven voorwaarden belangrijk.'],
        ['Waarschijnlijk weinig; er is nu al voldoende ruimte.', { space_available: 3 }, 'Een tekort aan tijd of energie lijkt niet de hoofdspanning.'],
        ['Dat kan ik niet goed voorspellen.', { space_uncertain: 2, inner_uncertain: 1 }, 'Het effect van meer draagkracht blijft moeilijk in te schatten.']
      ]
    },
    {
      id: 'revise', phase: 'Lens 3 · Hoeveel ruimte er werkelijk is', eyebrow: 'Mag een antwoord nog bewegen?',
      text: 'Hoe gemakkelijk kun je deze ja later herzien of opnieuw bespreken?', help: '',
      options: [
        ['Vrij gemakkelijk; het is klein en omkeerbaar.', { space_available: 3, rel_light: 1 }, 'Je ja lijkt redelijk klein en omkeerbaar.'],
        ['Dat kan, als ik vooraf duidelijke voorwaarden of een evaluatiemoment afspreek.', { space_negotiate: 4 }, 'Herziening wordt mogelijker door voorwaarden of een nieuw beslismoment.'],
        ['Moeilijk; anderen gaan er snel op bouwen of de gevolgen zijn groot.', { space_constrained: 3, rel_harmony: 1 }, 'Anderen of grote gevolgen maken herziening moeilijk.'],
        ['Niet zonder mogelijk nadeel voor mijn veiligheid, inkomen, zorg of positie.', { rel_power: 3, space_constrained: 4 }, 'Terugkomen op je ja kan echte risico’s dragen.'],
        ['Dat is nog onduidelijk.', { space_uncertain: 3 }, 'Je weet nog niet hoeveel ruimte er later is om bij te sturen.']
      ]
    },
    {
      id: 'needed', phase: 'Lens 3 · Hoeveel ruimte er werkelijk is', eyebrow: 'Wat de keuze nodig heeft',
      text: 'Wat zou jouw antwoord nu het eerlijkst maken?', help: 'Niet iedere situatie vraagt om meer moed. Soms zijn informatie, steun of veiligheid belangrijker.',
      options: [
        ['Meer tijd of concrete informatie.', { space_uncertain: 3, space_negotiate: 1 }, 'Je antwoord heeft vooral tijd of informatie nodig.'],
        ['Een kleinere omvang, duidelijke grens of einddatum.', { space_negotiate: 4, space_capacity: 1 }, 'Je antwoord heeft vooral omvang, grens of einddatum nodig.'],
        ['Werkelijke toestemming én woorden om nee te zeggen.', { space_negotiate: 2, rel_power: 1, inner_automatic: 1 }, 'Je antwoord heeft meer ervaarbare ruimte voor een nee nodig.'],
        ['Steun van iemand die mijn positie begrijpt.', { rel_care: 1, rel_power: 2, space_constrained: 1 }, 'Steun van een betrouwbare ander kan je keuzevrijheid vergroten.'],
        ['Eigenlijk niets; ik kan deze ja bewust dragen.', { inner_values: 2, inner_instemming: 1, space_available: 3 }, 'Je ervaart voldoende ruimte om deze ja bewust te dragen.'],
        ['Ik weet nog niet wat ontbreekt.', { inner_uncertain: 2, space_uncertain: 3 }, 'Wat je nodig hebt is nog niet duidelijk genoeg.']
      ]
    }
  ];

  const dimensionCopy = {
    inner: {
      inner_instemming: ['Er klinkt eigen zin', 'In je antwoorden is persoonlijke belangstelling of instemming duidelijk aanwezig. Dat maakt de keuze niet automatisch eenvoudig, maar wel merkbaar van jou.'],
      inner_values: ['Je ja draagt betekenis', 'Je antwoord lijkt verbonden met iets wat je bewust belangrijk vindt. Moeite en vrijwillige betrokkenheid kunnen hier tegelijk bestaan.'],
      inner_pressure: ['Er klinkt ook een innerlijk moeten', 'Schuld, zelfbeoordeling of de behoefte om goed genoeg te zijn wegen mee. Dat maakt je zorg niet onecht, maar wel complexer.'],
      inner_automatic: ['Je antwoord was sneller dan je aandacht', 'Je ja lijkt soms al onderweg voordat je wensen, grenzen of redenen volledig zijn ingehaald. Snelheid kan gul zijn én informatie overslaan.'],
      inner_uncertain: ['Je binnenste antwoord is nog niet af', 'Je voorkeur is nog niet helder of bevat tegenstrijdige signalen. Onzekerheid hoeft niet onmiddellijk weggewerkt te worden.']
    },
    relation: {
      rel_care: ['Zorg is hier een echte reden', 'Je ja ontstaat mede uit verbondenheid en de wens om iets of iemand bewust te dragen. Dat is meer dan sociale druk alleen.'],
      rel_reciprocity: ['Je ja leeft in wederkerigheid', 'Je antwoord lijkt deel van een relatie waarin geven en ontvangen over en weer bewegen.'],
      rel_harmony: ['Je ja beschermt ook de relatie', 'Teleurstelling, spanning of mogelijke verwijdering wegen mee. De rust tussen mensen is hier zelf een waarde én mogelijk een druk.'],
      rel_power: ['De gevolgen zijn niet gelijk verdeeld', 'Een nee kan werkelijke relationele, materiële of veiligheidsgevolgen hebben. Dan is keuzevrijheid niet alleen een kwestie van persoonlijke moed.'],
      rel_light: ['De relatie laat relatief veel ademruimte', 'De ander of de situatie lijkt een afwijkend antwoord redelijk te kunnen dragen. Dat geeft je keuze meer bewegingsruimte.']
    },
    space: {
      space_available: ['Er is werkelijke speelruimte', 'Je kunt waarschijnlijk kiezen, weigeren of later bijsturen zonder buitensporige gevolgen. Ruimte maakt een antwoord niet vanzelf juist, wel vrijer onderzoekbaar.'],
      space_negotiate: ['Je ja heeft voorwaarden nodig', 'De keuze wordt eerlijker wanneer omvang, timing, grens of evaluatiemoment bespreekbaar worden. Een voorwaardelijke ja is geen halve keuze.'],
      space_capacity: ['Willen en kunnen vallen niet helemaal samen', 'Tijd, energie of draagkracht beïnvloeden wat haalbaar is. Een beperkte capaciteit zegt niets negatiefs over de waarde van je betrokkenheid.'],
      space_constrained: ['De keuze is smaller dan ze lijkt', 'De gevolgen van weigeren of herzien beperken je werkelijke speelruimte. Zelfonderzoek kan die omstandigheden zichtbaar maken, maar lost ze niet alleen op.'],
      space_uncertain: ['Meer tijd of informatie hoort bij de keuze', 'Je weet nog niet genoeg over gevolgen, voorwaarden of je eigen antwoord. Die onzekerheid is inhoud van de keuze, geen ruis eromheen.']
    }
  };

  const home = document.querySelector('[data-depth-home]');
  const start = document.querySelector('[data-depth-start]');
  const stage = document.querySelector('[data-depth-quiz]');
  const result = document.querySelector('[data-depth-result]');
  const method = document.querySelector('[data-depth-method]');
  const form = document.querySelector('[data-context-form]');
  let current = 0;
  let answers = new Array(questions.length).fill(null);
  let context = '';
  let situation = '';
  let fit = '';
  let resultData = null;

  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function showStart() {
    home.hidden = false;
    start.hidden = false;
    stage.hidden = true;
    result.hidden = true;
    scrollTop();
  }

  function showOnly(target) {
    home.hidden = true;
    start.hidden = true;
    stage.hidden = target !== stage;
    result.hidden = target !== result;
    target.focus?.();
    scrollTop();
  }

  function selectedOption(questionIndex) {
    const answerIndex = answers[questionIndex];
    return answerIndex === null ? null : questions[questionIndex].options[answerIndex];
  }

  function renderQuestion() {
    const question = questions[current];
    const percent = Math.round((current + 1) / questions.length * 100);
    document.querySelector('[data-depth-context]').textContent = situation || context;
    document.querySelector('[data-depth-phase]').textContent = question.phase;
    document.querySelector('[data-depth-count]').textContent = `Vraag ${current + 1} van ${questions.length}`;
    document.querySelector('[data-depth-progress]').style.width = `${percent}%`;
    document.querySelector('[data-depth-eyebrow]').textContent = question.eyebrow;
    document.querySelector('[data-depth-question]').textContent = question.text;
    const help = document.querySelector('[data-depth-help]');
    help.textContent = question.help;
    help.hidden = !question.help;
    const fieldset = document.querySelector('[data-depth-options]');
    fieldset.replaceChildren(...question.options.map((option, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'depth-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `depth-question-${current}`;
      input.id = `depth-option-${current}-${index}`;
      input.checked = answers[current] === index;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      const marker = document.createElement('b');
      marker.textContent = String.fromCharCode(65 + index);
      label.append(marker, document.createTextNode(option[0]));
      input.addEventListener('change', () => {
        answers[current] = index;
        document.querySelector('[data-depth-next]').disabled = false;
      });
      wrapper.append(input, label);
      return wrapper;
    }));
    document.querySelector('[data-depth-previous]').disabled = current === 0;
    const next = document.querySelector('[data-depth-next]');
    next.disabled = answers[current] === null;
    next.textContent = current === questions.length - 1 ? 'Bekijk mijn drieluik →' : 'Volgende →';
  }

  function rankAxis(scores, axis) {
    return Object.keys(dimensionCopy[axis]).map(key => ({ key, score: scores[key] || 0 })).sort((a, b) => b.score - a.score);
  }

  function calculateResult() {
    const scores = {};
    questions.forEach((question, index) => {
      const option = selectedOption(index);
      Object.entries(option[1]).forEach(([key, value]) => { scores[key] = (scores[key] || 0) + value; });
    });
    const inner = rankAxis(scores, 'inner');
    const relation = rankAxis(scores, 'relation');
    const space = rankAxis(scores, 'space');
    let title = 'Een ja met meerdere stemmen';
    if (relation[0].key === 'rel_power' || space[0].key === 'space_constrained') title = 'Een ja in een smalle ruimte';
    else if (inner[0].key === 'inner_automatic') title = 'Een ja dat sneller was dan jij';
    else if (space[0].key === 'space_negotiate' || space[0].key === 'space_capacity') title = 'Een ja met voorwaarden';
    else if (inner[0].key === 'inner_pressure' || relation[0].key === 'rel_harmony') title = 'Een ja met twee stemmen';
    else if (inner[0].key === 'inner_values' && ['rel_care', 'rel_reciprocity'].includes(relation[0].key)) title = 'Een gedragen ja';
    else if (inner[0].key === 'inner_instemming' && space[0].key === 'space_available') title = 'Een ja met eigen adem';
    else if (inner[0].key === 'inner_uncertain' || space[0].key === 'space_uncertain') title = 'Een ja dat nog niet af is';
    return { scores, inner, relation, space, title };
  }

  function renderAxis(axis, ranked, titleSelector, copySelector, secondarySelector) {
    const primary = dimensionCopy[axis][ranked[0].key];
    const secondary = dimensionCopy[axis][ranked[1].key];
    document.querySelector(titleSelector).textContent = primary[0];
    document.querySelector(copySelector).textContent = primary[1];
    const close = ranked[1].score >= ranked[0].score - 2;
    document.querySelector(secondarySelector).textContent = close
      ? `Bijna even aanwezig: ${secondary[0].toLowerCase()}. Je antwoorden lopen hier niet allemaal dezelfde kant op.`
      : `Ook aanwezig: ${secondary[0].toLowerCase()}.`;
  }

  function counterfactualCopy() {
    const answer = selectedOption(8);
    const id = answer[3];
    if (id === 'same') return 'Je ja bleef grotendeels bestaan toen de mogelijke prijs van een nee wegviel. Dat wijst niet op een “zuiver” of beter antwoord, maar wel op instemming die niet volledig van druk afhankelijk lijkt.';
    if (id === 'no') return 'Toen de mogelijke prijs van een nee verdween, verschoof je antwoord richting nee. Het verschil tussen beide antwoorden maakt zichtbaar hoeveel relatie, verwachting of gevolg met jou meebeslist.';
    if (id === 'conditional') return 'Zonder de volle prijs van een nee verscheen geen eenvoudig nee, maar een kleinere of voorwaardelijke ja. Misschien ligt de eerlijkste beweging niet in kiezen tussen alles of niets, maar in onderhandelen over vorm en grens.';
    return 'Zelfs toen een nee niets meer kostte, ontstond geen helder antwoord. Mogelijk heb je niet alleen meer vrijheid nodig, maar ook tijd, informatie of ervaring om te weten wat je wilt.';
  }

  function experimentFor(data) {
    if (data.relation[0].key === 'rel_power' || data.space[0].key === 'space_constrained') return ['Teken eerst de werkelijke ruimte', 'Schrijf drie kolommen: “wat kost een nee?”, “wie heeft invloed?” en “welke steun of veilige tussenstap bestaat er?”. Forceer jezelf niet tot een grens die in deze situatie onveilig of onhaalbaar voelt.'];
    if (data.inner[0].key === 'inner_automatic') return ['Leen jezelf één zin', 'Gebruik bij het volgende verzoek: “Ik kijk even of dit past en kom erop terug.” Merk alleen op wat die korte pauze verandert; je hoeft daarna niet noodzakelijk nee te zeggen.'];
    if (data.space[0].key === 'space_negotiate') return ['Maak van ja geen blanco cheque', 'Vul één zin aan: “Ik wil dit doen, als …”. Kies één concrete voorwaarde over tijd, omvang, steun of een moment waarop je opnieuw mag beslissen.'];
    if (data.space[0].key === 'space_capacity') return ['Scheid bereidheid van draagkracht', 'Schrijf twee zinnen: “Wat ik wil geven is …” en “Wat ik nu werkelijk kan dragen is …”. Kijk of een kleinere vorm beide zinnen kan respecteren.'];
    if (data.inner[0].key === 'inner_uncertain' || data.space[0].key === 'space_uncertain') return ['Laat niet-weten iets concreets vragen', 'Noteer welke ene informatie, ervaring of bedenktijd je antwoord het meest zou helpen. Vraag precies dát, in plaats van jezelf tot onmiddellijke zekerheid te dwingen.'];
    if (data.relation[0].key === 'rel_harmony' || data.inner[0].key === 'inner_pressure') return ['Maak teleurstelling iets draaglijker', 'Oefen één vriendelijke zin zonder ze meteen te gebruiken: “Ik weet dat dit niet is waarop je hoopte, maar dit is wat voor mij nu past.” Let op wat er in jou reageert.'];
    return ['Geef je ja een eigen reden én een grens', 'Maak de zin af: “Ik kies hiervoor omdat …, en ik wil opnieuw kijken wanneer …”. Zo hoeft een oprechte ja niet grenzeloos te worden.'];
  }

  function renderResult() {
    resultData = calculateResult();
    fit = '';
    document.querySelectorAll('[data-fit]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    document.querySelector('[data-depth-reflection]').value = '';
    document.querySelector('[data-save-depth]').disabled = false;
    document.querySelector('[data-save-depth]').textContent = 'Bewaar dit drieluik in Mijn spoor';
    document.querySelector('[data-save-depth-status]').textContent = '';
    document.querySelector('[data-result-context]').textContent = situation ? `${context} · ${situation}` : context;
    document.querySelector('[data-result-title]').textContent = resultData.title;
    document.querySelector('[data-result-intro]').textContent = 'Je antwoorden laten geen vast type zien. Ze tonen drie lijnen die in deze ene situatie tegelijk aanwezig kunnen zijn.';
    renderAxis('inner', resultData.inner, '[data-inner-title]', '[data-inner-copy]', '[data-inner-secondary]');
    renderAxis('relation', resultData.relation, '[data-relation-title]', '[data-relation-copy]', '[data-relation-secondary]');
    renderAxis('space', resultData.space, '[data-space-title]', '[data-space-copy]', '[data-space-secondary]');
    document.querySelector('[data-counterfactual]').textContent = counterfactualCopy();
    const traceIndexes = [0, 4, 8, 11];
    document.querySelector('[data-answer-trace]').replaceChildren(...traceIndexes.map(index => {
      const item = document.createElement('li');
      item.textContent = selectedOption(index)[2];
      return item;
    }));
    const experiment = experimentFor(resultData);
    document.querySelector('[data-experiment-title]').textContent = experiment[0];
    document.querySelector('[data-experiment-copy]').textContent = experiment[1];
    showOnly(result);
  }

  function saveResult() {
    try {
      const raw = localStorage.getItem(trackStorageKey) || localStorage.getItem(previousTrackStorageKey);
      const progress = raw ? JSON.parse(raw) : { checks: new Array(7).fill(false), note: '', startedAt: new Date().toISOString(), completedWeeks: [], carryForward: '' };
      if (!progress || typeof progress !== 'object') throw new Error('Ongeldig spoor');
      if (!Array.isArray(progress.quizSnapshots)) progress.quizSnapshots = [];
      const reflection = document.querySelector('[data-depth-reflection]').value.trim();
      const summary = [
        dimensionCopy.inner[resultData.inner[0].key][0],
        dimensionCopy.relation[resultData.relation[0].key][0],
        dimensionCopy.space[resultData.space[0].key][0]
      ].join(' · ');
      const experiment = experimentFor(resultData);
      progress.quizSnapshots.unshift({
        kind: 'depth', quizId: 'dieptequiz-ja', quizTitle: 'Dieptequiz · Waar komt jouw ja vandaan?',
        resultId: resultData.title.toLowerCase().replace(/\s+/g, '-'), resultTitle: resultData.title,
        summary, experiment: `${experiment[0]} — ${experiment[1]}`, context, situation,
        fit, reflection, savedAt: new Date().toISOString()
      });
      progress.quizSnapshots = progress.quizSnapshots.slice(0, 24);
      localStorage.setItem(trackStorageKey, JSON.stringify(progress));
      localStorage.removeItem(previousTrackStorageKey);
      const button = document.querySelector('[data-save-depth]');
      button.disabled = true;
      button.textContent = 'Bewaard in Mijn spoor';
      document.querySelector('[data-save-depth-status]').textContent = 'Je drieluik en eigen woorden staan alleen in deze browser in Mijn spoor.';
    } catch (_) {
      document.querySelector('[data-save-depth-status]').textContent = 'Bewaren lukt niet in deze browser. Je drieluik blijft wel zichtbaar.';
    }
  }

  form.addEventListener('change', () => {
    document.querySelector('[data-begin-depth]').disabled = !form.elements.context.value;
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    context = form.elements.context.value;
    situation = document.querySelector('[data-situation]').value.trim();
    current = 0;
    answers = new Array(questions.length).fill(null);
    showOnly(stage);
    renderQuestion();
  });
  document.querySelector('[data-return-start]').addEventListener('click', showStart);
  document.querySelector('[data-depth-previous]').addEventListener('click', () => { if (current > 0) { current -= 1; renderQuestion(); } });
  document.querySelector('[data-depth-next]').addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < questions.length - 1) { current += 1; renderQuestion(); }
    else renderResult();
  });
  document.querySelectorAll('[data-fit]').forEach(button => button.addEventListener('click', () => {
    fit = button.dataset.fit;
    document.querySelectorAll('[data-fit]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  document.querySelector('[data-save-depth]').addEventListener('click', saveResult);
  document.querySelector('[data-restart-depth]').addEventListener('click', showStart);
})();
