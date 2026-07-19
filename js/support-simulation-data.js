(function () {
  const first = (id, text, reply, effect, missing, signals, movements, repair) => ({ id, text, reply, effect, missing, signals, movements, repair });
  const second = (id, text, reply, effect, signals, movements, recovery = false) => ({ id, text, reply, effect, signals, movements, recovery });
  window.SUPPORT_SIMULATION_V2 = {
    id:'luisteren-of-repareren',
    title:'Luister je nog — of heb je het al opgelost?',
    eyebrow:'Gesprekssimulatie · helpen zonder automatisch over te nemen',
    mode:'support',
    introTitle:'Zes gesprekken. Jouw woorden veranderen wat erna mogelijk wordt.',
    introCopy:'Iemand vertelt iets moeilijks. Je kiest een eerste reactie, ziet hoe die in dit gesprek kan landen en krijgt daarna een tweede kans: afstemmen, praktisch helpen, verantwoordelijkheid verdelen, herstellen of begrenzen.',
    resultOrder:[],
    dimensions:{ afstemming:{label:'Afstemming'}, autonomie:{label:'Autonomie en verantwoordelijkheid'}, draagkracht:{label:'Draagkracht en grenzen'} },
    movements:{
      erkennen:{group:'helpful',label:'Erkennen zonder alles al te verklaren'}, toetsen:{group:'helpful',label:'Een interpretatie laten corrigeren'}, steunvraag:{group:'helpful',label:'Onderzoeken welke steun nu past'}, praktisch:{group:'helpful',label:'Concrete hulp passend inzetten'}, autonomie:{group:'helpful',label:'Keuze en uitvoering zichtbaar verdelen'}, verantwoordelijkheid:{group:'helpful',label:'Verantwoordelijkheid nemen die bij je rol hoort'}, begrenzen:{group:'helpful',label:'Draagkracht warm en concreet begrenzen'}, herstellen:{group:'helpful',label:'Van koers veranderen wanneer iets niet aansluit'},
      geruststellen:{group:'pressure',label:'Snel zekerheid proberen te geven'}, oplossen:{group:'pressure',label:'Vroeg naar een oplossing bewegen'}, overnemen:{group:'pressure',label:'Taak of regie grotendeels overnemen'}, terugleggen:{group:'pressure',label:'Verantwoordelijkheid te volledig terugleggen'}, uitstellen:{group:'pressure',label:'Praktische actie uitstellen terwijl tijd telt'}, vaaggrenzen:{group:'pressure',label:'Ruimte of een grens onbepaald laten'}, doorduwen:{group:'pressure',label:'Blijven praten terwijl een pauze gevraagd wordt'}, invullen:{group:'pressure',label:'De betekenis te snel invullen'}
    },
    questions:[
      {
        scene:'Gesprek 1 · Hetzelfde verhaal komt terug', contextLabel:'Herhaling · geen acuut gevaar', contextTone:'ordinary', context:'Deze angst kwam al meermaals terug. Jij wilt steun bieden, maar merkt dat geruststelling telkens maar kort lijkt te helpen.', text:'“Ik weet dat ik hier al vaak over begonnen ben, maar ik blijf denken dat mijn partner mij uiteindelijk gaat verlaten.”',
        options:[
          first('g1-a','“Ik hoor dat die angst nog altijd terugkomt. Wat maakt hem vandaag zo sterk?”','“Ik weet het niet precies. Ik blijf ieder klein signaal analyseren.”','Je erkent en onderzoekt. Dat opent informatie, maar kan ook opnieuw een lange analyse voeden.','Nog onduidelijk: wil de ander onderzoeken, geruststelling, afleiding of alleen gezelschap?',{afstemming:2},['erkennen'],'Ik merk dat ik je opnieuw de analyse in trok. Zullen we kort kijken wat nú helpt?'),
          first('g1-b','“Je partner heeft toch vaak gezegd dat er niets is? Probeer je daaraan vast te houden.”','“Dat geloof ik telkens even. Daarna begint het gewoon opnieuw.”','Je biedt snelle zekerheid. Dat kan kort rust geven, maar het terugkerende patroon blijft onbesproken.','Nog onduidelijk: wat helpt langer dan de volgende geruststelling?',{},['geruststellen'],'Ik merkte dat ik je opnieuw probeerde gerust te stellen. Dat sluit blijkbaar niet lang aan.'),
          first('g1-c','“Wat heb je nu van mij nodig dat in onze vorige gesprekken misschien ontbrak?”','“Ik weet het niet. Ik wil vooral dat dit gevoel stopt.”','Je stemt expliciet af. De ander heeft alleen nog geen helder antwoord.','Nog onduidelijk: welke twee concrete vormen van steun kunnen nu verkend worden?',{afstemming:2,autonomie:1},['steunvraag'],'Mijn vraag was misschien te open. Ik kan twee mogelijkheden voorstellen.'),
          first('g1-d','“Ik wil er even bij blijven, maar ik heb vandaag geen ruimte voor opnieuw een lang gesprek.”','“Oké… ik wilde je ook niet opnieuw belasten.”','Je benoemt draagkracht. Zonder warmte of vervolg kan de grens als afstandelijk aankomen.','Nog onduidelijk: hoeveel ruimte heb je wél en wanneer kan het gesprek terugkomen?',{draagkracht:2},['begrenzen'],'Mijn grens klonk korter dan bedoeld. Ik wil niet verdwijnen.')
        ],
        secondOptions:[
          second('g1-1','“Wil je dat ik luister, je even afleid of één gedachte met je onderzoek?”','“Doe maar even afleiding. Ik zit al lang genoeg in mijn hoofd.”','Je biedt hanteerbare keuzes wanneer de ander het zelf nog niet weet.',{afstemming:2,autonomie:1},['steunvraag']),
          second('g1-2','“Zullen we opmerken dat geruststelling kort helpt en samen iets anders proberen?”','“Ja. Alleen opnieuw horen dat alles goed komt verandert weinig.”','Je benoemt het patroon zonder de angst te bespotten.',{afstemming:2},['toetsen']),
          second('g1-3','“Ik kan nu tien minuten echt luisteren. Daarna moet ik stoppen.”','“Dat is duidelijk. Tien minuten is oké.”','Je maakt beschikbaarheid warm en concreet.',{afstemming:1,draagkracht:2},['begrenzen']),
          second('repair','', '“Oké. Dit voelt meer alsof je kijkt naar wat er nu gebeurt.”','Je verandert van koers nadat je merkte dat de eerste reactie niet volledig aansloot.',{afstemming:2},['herstellen'],true)
        ]
      },
      {
        scene:'Gesprek 2 · De presentatie die morgen af moet', contextLabel:'Tijdsdruk · praktische hulp', contextTone:'ordinary', context:'De deadline is morgen. De ander vraagt rechtstreeks of jij de taak wilt overnemen; jij hebt beperkte tijd.', text:'“Ik krijg deze presentatie nooit op tijd af. Jij bent hier veel beter in. Kun jij ze vanavond niet gewoon voor mij maken?”',
        options:[
          first('g2-a','“Ik kan twintig minuten met je kijken waar je precies vastloopt.”','“Ik ben bang om slecht beoordeeld te worden. Twintig minuten voelt wel weinig.”','Je biedt afgebakende samenwerking. De tijd is helder, maar mogelijk onvoldoende.','Nog onduidelijk: welk onderdeel is essentieel en hoeveel hulp maakt verschil?',{afstemming:1,autonomie:1,draagkracht:2},['praktisch','begrenzen'],'Ik begrensde de tijd voordat we wisten waar die het meeste verschil maakt.'),
          first('g2-b','“Stuur ze door. Ik kijk hoeveel ik vanavond nog kan afwerken.”','“Dank je. Als jij het doet, weet ik tenminste dat het goed is.”','Je geeft snelle verlichting. Taakverdeling en eindverantwoordelijkheid blijven vaag.','Nog onduidelijk: wat doe jij precies en wat blijft bij de ander?',{},['overnemen','vaaggrenzen'],'Ik nam te snel de hele taak aan. Laten we het werk opnieuw verdelen.'),
          first('g2-c','“Ik kan ze niet voor jou maken. Welk onderdeel vormt nu het grootste probleem?”','“De structuur. Ik blijf dia’s herschrijven en raak nergens.”','Je houdt verantwoordelijkheid helder en zoekt een gericht aangrijpingspunt.','Nog onduidelijk: welke afgebakende steun kun je wél bieden?',{afstemming:1,autonomie:2,draagkracht:1},['autonomie','begrenzen'],'Mijn nee klonk kort. Ik kan niet overnemen, maar wel gerichter helpen.'),
          first('g2-d','“Laten we eerst bekijken wat morgen werkelijk af moet zijn.”','“Vooral de kern moet staan. De vorm kan misschien later.”','Je prioriteert voordat iemand begint te werken. De directe hulpvraag is nog niet volledig beantwoord.','Nog onduidelijk: wie voert welk noodzakelijk deel uit?',{afstemming:2,autonomie:1},['praktisch'],'Nu we de kern kennen, moeten we nog eerlijk verdelen wie wat doet.')
        ],
        secondOptions:[
          second('g2-1','“We maken samen de structuur. Jij werkt daarna de dia’s af.”','“Als de lijn staat, krijg ik de rest waarschijnlijk wel gedaan.”','Je ondersteunt competentie zonder de uitvoering te vervangen.',{afstemming:2,autonomie:2},['praktisch','autonomie']),
          second('g2-2','“Kies één onderdeel dat ik kan nakijken; de rest blijft van jou.”','“Wil je dan vooral de kernboodschap controleren?”','De hulp wordt concreet en begrensd.',{autonomie:2,draagkracht:2},['praktisch','begrenzen']),
          second('g2-3','“Vanavond lukt niet. Ik stuur een sjabloon en kijk morgenvroeg tien minuten.”','“Minder dan gehoopt, maar het geeft me een vertrekpunt.”','Je belooft geen onhaalbare hulp en biedt een alternatief.',{draagkracht:2,autonomie:1},['begrenzen','praktisch']),
          second('repair','', '“Dat is duidelijker. Nu weet ik wat jij doet en wat bij mij blijft.”','Je maakt de hulp concreter en herstelt een onduidelijke taakverdeling.',{afstemming:1,autonomie:2},['herstellen','autonomie'],true)
        ]
      },
      {
        scene:'Gesprek 3 · “Misschien stel ik mij aan”', contextLabel:'Grensoverschrijdende ervaring · veiligheid en regie', contextTone:'warning', context:'De bedoeling van de andere persoon is onbekend. De gesprekspartner ging achteruit, maar werd opnieuw aangeraakt.', text:'“Die persoon bleef mij aanraken nadat ik achteruitging. Maar misschien stel ik mij aan. Het was waarschijnlijk niet slecht bedoeld.”',
        options:[
          first('g3-a','“Je hoeft de bedoeling niet te kennen om serieus te nemen dat jij afstand wilde.”','“Ik ben vooral bang dat anderen zullen zeggen dat het niets voorstelde.”','Je neemt de grens serieus zonder onbekende motieven in te vullen.','Nog onduidelijk: wil de ander erkenning, veiligheid of iemand om mee te praten?',{afstemming:2,autonomie:1},['erkennen'],'Ik wil ook controleren welke steun jij nu wilt.'),
          first('g3-b','“Wil je vertellen wat er precies gebeurde en wat je nu het meeste bezighoudt?”','“Ik wil niet alles opnieuw vertellen. Ik ben bang dat niemand me gelooft.”','Je vraagt context. Dat kan ook klinken alsof details eerst bewezen moeten worden.','Nog onduidelijk: hoeveel wil de ander nu vertellen?',{afstemming:1,autonomie:1},['steunvraag'],'Ik vroeg te snel om details. Je hoeft niet verder te vertellen.'),
          first('g3-c','“Misschien had die persoon het niet door. Kun je het de volgende keer explicieter zeggen?”','“Ik ging al achteruit. Waarom lag het dan nog aan mij?”','Je zoekt een toekomstige strategie, maar verschuift verantwoordelijkheid naar degene die afstand nam.','Nog onduidelijk: wat heeft de ander nu nodig vóór toekomstige opties?',{},['invullen','terugleggen'],'Je hebt gelijk: achteruitgaan was al informatie. Ik schoof de verantwoordelijkheid te snel naar jou.'),
          first('g3-d','“Zullen we kijken of je die persoon opnieuw moet zien en wat dan veilig voelt?”','“Misschien later. Ik wil eerst weten dat ik dit niet verzin.”','Je richt je op veiligheid, maar loopt vóór op de uitgesproken behoefte aan erkenning.','Nog onduidelijk: is er een onmiddellijke veiligheidsvraag?',{afstemming:1,autonomie:1},['praktisch'],'Ik ging te snel naar een plan. Eerst wil ik horen wat dit voor jou betekende.')
        ],
        secondOptions:[
          second('g3-1','“Ik neem serieus dat jij afstand wilde. Je hoeft nu niets te bewijzen.”','“Dank je. Dat is wat ik eerst nodig had.”','Je biedt erkenning zonder juridische conclusie.',{afstemming:2,autonomie:1},['erkennen']),
          second('g3-2','“Wil je dat ik luister, of samen kijken wie veilig genoeg is om dit te bespreken?”','“Eerst praten. Daarna wil ik misschien iemand kiezen.”','Je biedt twee routes en laat het tempo bij de ander.',{afstemming:2,autonomie:2},['steunvraag','autonomie']),
          second('g3-3','“Moet je die persoon binnenkort zien? Dan kunnen we veiligheidsopties bekijken.”','“Volgende week. Ik wil daar niet alleen mee zitten.”','Je maakt veiligheid concreet zonder de confrontatie over te nemen.',{afstemming:1,autonomie:2},['praktisch','autonomie']),
          second('repair','', '“Dank je. Ik ben nog voorzichtig, maar dit sluit beter aan.”','Je corrigeert je eerdere koers; dat wist de eerste reactie niet uit.',{afstemming:2,autonomie:1},['herstellen'],true)
        ]
      },
      {
        scene:'Gesprek 4 · De deadline van het formulier', contextLabel:'Morgen deadline · mogelijk verlies van inkomen', contextTone:'urgent', context:'Tijd en correcte informatie zijn belangrijk. Jij bent geen dossierdeskundige.', text:'“Morgen verloopt de termijn en ik begrijp die formulieren nog altijd niet. Als ik dit verkeerd invul, verlies ik misschien mijn uitkering.”',
        options:[
          first('g4-a','“Laten we eerst vaststellen wat morgen precies ingediend moet zijn.”','“Ik weet zelfs niet welk deel verplicht is. Ik krijg het niet meer overzien.”','Je neemt de deadline serieus en begint met prioriteren.','Nog onduidelijk: waar staat officiële informatie en wie kan controleren?',{afstemming:1,autonomie:1},['praktisch'],'Prioriteren alleen is niet genoeg; we hebben betrouwbare informatie nodig.'),
          first('g4-b','“Geef de formulieren maar. Ik vul ze in zodat ze op tijd weg zijn.”','“Graag. Ik ben bang dat ik anders niets indien.”','Je verlaagt de belasting snel, maar neemt inhoud en risico over.','Nog onduidelijk: wie controleert en blijft verantwoordelijk voor de gegevens?',{},['overnemen','oplossen'],'Ik nam te snel alles vast. Laten we samen invullen en de gegevens controleren.'),
          first('g4-c','“Dit lijkt me iets waarvoor we professionele informatie nodig hebben.”','“Maar waar vind ik die nu nog? Morgen is het te laat.”','Je erkent je expertisegrens. Zonder concrete brug kan doorverwijzen tijd verliezen.','Nog onduidelijk: welke officiële dienst is vandaag bereikbaar?',{draagkracht:1},['uitstellen'],'Alleen doorverwijzen helpt nu niet genoeg. Ik zoek de concrete brug mee.'),
          first('g4-d','“Je klinkt overweldigd. Zullen we eerst alles rustig op een rij leggen?”','“Ja, maar ik ben bang dat rustig doen betekent dat we de termijn missen.”','Je erkent belasting en biedt structuur. Urgentie moet nu actie worden.','Nog onduidelijk: wat moet vandaag gebeuren om rechten veilig te stellen?',{afstemming:2},['erkennen'],'Je hebt gelijk dat tijd telt. Laten we rust en actie combineren.')
        ],
        secondOptions:[
          second('g4-1','“We openen de officiële instructies en bellen de bevoegde dienst bij twijfel.”','“Goed. Dan weten we waarop we ons baseren.”','Je koppelt snelle actie aan betrouwbare informatie.',{afstemming:2,autonomie:1},['praktisch']),
          second('g4-2','“Jij zoekt je gegevens; ik lees de instructies en noteer wat ontbreekt.”','“Dat kan ik aan. Dan blijft het overzichtelijk.”','Je verdeelt de taak zonder alles over te nemen.',{autonomie:2,draagkracht:1},['praktisch','autonomie']),
          second('g4-3','“We zoeken eerst uit wat vóór de deadline minimaal ingediend moet zijn.”','“Ja. Perfect kan later misschien nog.”','Je maakt de praktische urgentie hanteerbaar.',{afstemming:1,autonomie:1},['praktisch']),
          second('repair','', '“Dank je. Zo gebeurt er nu iets zonder dat ik alle controle kwijt ben.”','Je herstelt door expertise, taakverdeling en urgentie samen te nemen.',{afstemming:1,autonomie:2},['herstellen','praktisch'],true)
        ]
      },
      {
        scene:'Gesprek 5 · Jij hebt meer macht', contextLabel:'Leidinggevende en werknemer · ongelijke positie', contextTone:'power', context:'Jij hebt invloed op planning, prioriteiten en beoordeling. Empathische woorden alleen veranderen de werksituatie niet.', text:'“De planning is eigenlijk niet haalbaar, maar ik wil niet overkomen alsof ik niet gemotiveerd ben.”',
        options:[
          first('g5-a','“Dank je dat je dit zegt. Welke onderdelen maken de planning onhaalbaar?”','“Vooral twee deadlines. Ik ben bang dat eerlijk zijn mijn kansen schaadt.”','Je nodigt concrete informatie uit. Bescherming en vervolg zijn nog niet benoemd.','Nog onduidelijk: hoe gebruik jij deze informatie?',{afstemming:2},['erkennen','toetsen'],'Ik vroeg informatie zonder te zeggen wat ik ermee zal doen.'),
          first('g5-b','“Ik weet dat je gemotiveerd bent. Laten we kijken hoe dit binnen de planning lukt.”','“Maar ik denk juist dat de planning zelf niet kan blijven staan.”','Je stelt gerust en zoekt een oplossing, maar houdt de planning als vast uitgangspunt.','Nog onduidelijk: mag de planning zelf veranderen?',{afstemming:1},['geruststellen','oplossen'],'Je hebt gelijk: ik hield de planning te snel vast. Die moet ook getoetst worden.'),
          first('g5-c','“Wat zou volgens jou moeten veranderen om dit realistisch te maken?”','“Ik heb ideeën, maar wil niet alleen verantwoordelijk worden voor een nieuw plan.”','Je geeft inspraak, maar kunt verantwoordelijkheid naar beneden schuiven.','Nog onduidelijk: welk deel van de oplossing hoort bij jou?',{afstemming:1,autonomie:1},['terugleggen'],'Ik vroeg jou te veel van de oplossing te dragen. Die verantwoordelijkheid ligt ook bij mij.'),
          first('g5-d','“Ik wil dit serieus bekijken en vandaag de grootste risico’s helder krijgen.”','“Dat helpt, als ik ook weet wat er daarna met mijn antwoord gebeurt.”','Je erkent verantwoordelijkheid en onzekerheid. Concrete transparantie moet volgen.','Nog onduidelijk: wanneer en hoe volgt een beslissing?',{afstemming:1,autonomie:1},['verantwoordelijkheid'],'Ik moet concreet zeggen welke opvolging jij van mij krijgt.')
        ],
        secondOptions:[
          second('g5-1','“Ik leg vast dat jij een planningsrisico meldt, niet een gebrek aan motivatie.”','“Dat maakt het veiliger om concreet te zijn.”','Je maakt zichtbaar hoe de informatie wordt geïnterpreteerd.',{afstemming:1,autonomie:1},['verantwoordelijkheid']),
          second('g5-2','“Ik toets vandaag zelf de planning en koppel morgen terug wat verandert.”','“Goed. Dan ligt de oplossing niet volledig bij mij.”','Je neemt de vervolgstap die bij je rol hoort.',{autonomie:2,draagkracht:1},['verantwoordelijkheid','praktisch']),
          second('g5-3','“Geef de risico’s. Ik beslis daarna welke prioriteiten we aanpassen.”','“Dan kan ik informatie geven zonder alles te dragen.”','Je combineert inspraak met heldere rolverantwoordelijkheid.',{afstemming:2,autonomie:2},['toetsen','verantwoordelijkheid']),
          second('repair','', '“Dat is duidelijker. Nu weet ik beter wat spreken hier werkelijk in beweging zet.”','Je gebruikt metacommunicatie en neemt verantwoordelijkheid terug.',{afstemming:2,autonomie:2},['herstellen','verantwoordelijkheid'],true)
        ]
      },
      {
        scene:'Gesprek 6 · “Laat maar”', contextLabel:'Conflict · pauze en terugkeer', contextTone:'ordinary', context:'Het gesprek werd scherp. Er is geen acuut gevaar. Jullie moeten ruimte en relationele continuïteit vormgeven.', text:'“Laat maar. Het heeft toch geen zin om hierover te praten.”',
        options:[
          first('g6-a','“Oké. Ik laat het nu even rusten.”','“Ik heb tijd nodig. Ik weet alleen niet hoeveel.”','Je respecteert de stop. Het blijft onduidelijk of het gesprek terugkomt.','Nog onduidelijk: gaat het om een pauze of het einde van het onderwerp?',{draagkracht:1},['vaaggrenzen'],'Ik liet de terugkeer te open. Ik wil ruimte geven zonder te verdwijnen.'),
          first('g6-b','“Ik wil het niet forceren, maar ook niet doen alsof het opgelost is. Wat heb je nodig?”','“Tijd. Alleen weet ik nog niet hoeveel.”','Je combineert ruimte en continuïteit. De ander heeft nog geen concreet antwoord.','Nog onduidelijk: welk moment is haalbaar voor jullie beiden?',{afstemming:2,draagkracht:1},['steunvraag','begrenzen'],'Mijn vraag is misschien nog te open. Ik kan een voorstel doen.'),
          first('g6-c','“Ik merk dat ik mezelf wil verdedigen. Wat heeft voor jou geen zin meer?”','“Nu voelt zelfs die vraag als druk. Ik wil eerst stoppen.”','Je gebruikt metacommunicatie, maar blijft vragen terwijl een pauze gezocht wordt.','Nog onduidelijk: kan begrip later worden gezocht?',{afstemming:1},['toetsen','doorduwen'],'Je hebt gelijk: ik bleef vragen. Ik stop nu en kom later terug.'),
          first('g6-d','“We kunnen dit beter nu uitpraten, anders wordt het groter.”','“Dat is waarom ik wil stoppen. Ik kan nu niet meer luisteren.”','Je zoekt duidelijkheid, maar gaat voorbij aan de huidige draagkracht.','Nog onduidelijk: wat is nodig om later opnieuw te praten?',{},['doorduwen','oplossen'],'Ik duwde door terwijl je om een pauze vroeg. Ik stop nu.')
        ],
        secondOptions:[
          second('g6-1','“Zullen we morgen kort bekijken of praten dan lukt?”','“Morgen kan ik proberen. Ik beloof nog niet dat ik klaar ben.”','Je stelt een concreet maar onderhandelbaar moment voor.',{afstemming:1,draagkracht:2},['begrenzen']),
          second('g6-2','“Ik geef je vanavond ruimte en stuur morgenochtend één keer.”','“Dat geeft ruimte zonder dat het onderwerp verdwijnt.”','Je maakt pauze en terugkeer concreet.',{afstemming:1,draagkracht:2},['begrenzen']),
          second('g6-3','“Onbepaalde stilte is voor mij niet haalbaar. Kunnen we over twee dagen inchecken?”','“Een kort bericht dan lukt waarschijnlijk.”','Je formuleert ook je eigen grens en laat onderhandeling toe.',{afstemming:1,draagkracht:2},['begrenzen','autonomie']),
          second('repair','', '“Oké. Ik ben nog gespannen, maar dit voelt minder dwingend.”','Je herstel wist de eerdere druk niet uit, maar verandert de volgende stap.',{afstemming:2,draagkracht:2},['herstellen','begrenzen'],true)
        ]
      }
    ]
  };
})();
