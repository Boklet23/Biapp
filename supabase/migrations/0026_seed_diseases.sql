-- Seed: 10 birøkt-sykdommer med sesongvis behandlingsveiledning
-- Kilde: Veterinærinstituttet, Mattilsynet, Norges Birøkterlag, COLOSS BeeBook

INSERT INTO public.diseases
  (slug, name_no, is_notifiable, severity, description, symptoms, treatment, prevention,
   seasonal_treatment, diagnostic_tips, goal, sources, image_prompt, photos, sort_order)
VALUES

/* ──────────────────────────────────────────────────────
   1. VARROAMIDD
   ────────────────────────────────────────────────────── */
(
  'varroamidd', 'Varroamidd', false, 'alvorlig',
  'Varroamidd (Varroa destructor) er den alvorligste parasitten i norsk birøkt. Den suger blod fra bier og yngel, svekker immunforsvaret og sprer virus som deformed wing virus (DWV). Uten behandling kollapser kolonien vanligvis innen 2–3 år.',
  'Misdannede vinger (deformed wing virus), krympede bier, larver som dør i celler, synlige rødbrune midd (1,5 mm) på bienes bakkropp. Ved høyt press: kraftig koloninedgang om høsten.',
  'Oksalsyre (vinterstid når det er yngelfritt), Apistan, ApiLife Var eller Apivar. Kombinér alltid med tellemetode for å vurdere tetthet. Roter mellom virkemidler for å hindre resistens.',
  'Regelmessig varroatelling (limbunn, vaskemetode eller sukkerpudder). Sværmforebygging reduserer yngelmengde og gir naturlig behandlingsvindu.',
  '[
    {"season": "Vår", "tips": [
      "Tell varroa i april–mai med limbunn (3 dager): >1 midd/dag = behandling nødvendig.",
      "Sværmforebygging gir naturlig yngelstans — utnytt dette som behandlingsvindu.",
      "Drone-yngel-fjerning: forseglet droneyngel har 10× mer midd enn arbeideryngel."
    ]},
    {"season": "Sommer", "tips": [
      "Unngå kjemisk behandling under honninginnsamling — vent til superne er tatt av.",
      "Biotekniske tiltak: kunstig yngelstans via dronningbytte gir behandlingsvindu.",
      "Fortsett jevnlig telling — varroatettheten kan dobles på 4–5 uker i juli."
    ]},
    {"season": "Høst", "tips": [
      "Etter siste slynging: sett inn Apistan-strimler, ApiLife Var eller Apivar-gelé.",
      "Behandlingstid 6–8 uker. Roter produkter mellom sesonger for å hindre resistens.",
      "Avslutt behandling senest 1. oktober for å beskytte vinterbienes immunsystem."
    ]},
    {"season": "Vinter", "tips": [
      "Oksalsyre-drypp (3,5 % i 30 % sukkeroppløsning) ved yngelfri koloni: desember–januar.",
      "Dråpemetode: 5 ml per ramme med bier, maks 50 ml per kube.",
      "Oksalsyredamp gir >90 % effekt, men krever godkjent utstyr og vernemaske P2."
    ]}
  ]'::jsonb,
  'Limbunn-metode: legg inn hvit papirplate smurt med 50 % olje i 3 dager, tell midd. >1 midd/dag = høyt press. Vaskemetode: 100 bier fra yngelramme i 70 % alkohol, rist 30 sek, trekk ut og tell. >2 % = behandling nødvendig. Sukkerpudder-metode som alkoholfritt alternativ.',
  'Holde varroa-infeksjonsrate under 1 % (1 midd per 100 bier) gjennom hele sesongen. Vinterbier uten høy varroabelastning er avgjørende for god overvintring og sterk vårkoloni.',
  'Veterinærinstituttet (2024), Norges Birøkterlag — Varroaveilederen, COLOSS BeeBook Vol. II',
  'Ultra-close macro photograph of a Varroa destructor mite clinging to the abdomen of a honey bee. Natural lighting, extreme detail showing the reddish-brown oval exoskeleton of the 1.5mm mite against the fuzzy amber bee abdominal hairs. Shallow depth of field with honeycomb cells in soft background bokeh. Shot with Canon EF 100mm f/2.8L Macro IS USM, ISO 400, natural daylight. Scientific documentary photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Varroa_destructor_on_honeybee_host.jpg", "caption": "Varroamidd på bie — elektronmikroskopbilde (USDA)", "bg": "#F5F0FF"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Varroa_Mite.jpg", "caption": "Nærbilde av Varroa destructor (USDA)", "bg": "#FFF0F0"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Honey_bee_with_Deformed_Wing_Virus_and_Varroa_destructor.jpg", "caption": "Bie med misdannede vinger og synlig varroamidd", "bg": "#F0F8FF"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Abeilles-bees-treatment-varroa.jpg", "caption": "Bier reagerer på Apiguard-behandling mot Varroa", "bg": "#FFF5E6"}
  ]'::jsonb,
  1
),

/* ──────────────────────────────────────────────────────
   2. KALKYNGEL
   ────────────────────────────────────────────────────── */
(
  'kalkyngel', 'Kalkyngel', false, 'moderat',
  'Kalkyngel (Ascosphaera apis) er en soppinfeksjon som dreper forseglet og åpen yngel. Kadaverene stivner til hvite eller svarte kalk-lignende klumper. Fuktig og kjølig vær, kombinert med svak koloni, trigger vanligvis utbrudd.',
  'Hvite, kritt-aktige larver i eller utenfor cellene. Kan ligne tørket kalk. Svarte kadavere indikerer sporulering og høy smitterisiko. Flekkete yngelbilde uten stank.',
  'Ingen godkjent kjemisk behandling. Bytt dronning til en mer hygienisk rase. Sørg for god ventilasjon, unngå fuktighet i kuben. Fjern og bren sterkt infiserte rammer.',
  'Hygieniske bier (f.eks. Buckfast) fjerner smittet yngel raskt. Unngå overfylling og dårlig ventilasjon. Skrump inn kuben ved svak koloni.',
  '[
    {"season": "Vår", "tips": [
      "Kalkyngel er hyppigst i mai–juni ved kald, fuktig vår og rask vekst.",
      "Skrump inn kuben: biene må dekke alle rammer for å holde riktig temperatur.",
      "Åpne bunnen (trekkventilasjon) for å redusere relativ luftfuktighet."
    ]},
    {"season": "Sommer", "tips": [
      "Sterke kolonier rydder normalt smittet yngel selv (hygieneatferd).",
      "Dronningbytte til hygienisk rase hvis problemet vedvarer etter juni.",
      "Fjern og bren sterkt infiserte rammer — ikke flytt dem til andre kuber."
    ]},
    {"season": "Høst", "tips": [
      "Sett inn ny dronning av hygienisk rase senest august for neste sesong.",
      "Rengjør kubekassene grundig — A. apis-sporer overlever i voksrester og tre."
    ]},
    {"season": "Vinter", "tips": [
      "Unngå kondensbygging inne i kuben — god toppalufting er avgjørende.",
      "Isolasjonsplate på toppen reduserer temperatursvingninger som favoriserer sopp."
    ]}
  ]'::jsonb,
  'Hvite kadavere = aktiv infeksjon. Svarte kadavere = sporulering og høy smitterisiko. Flekkete yngelbilde uten stank skiller kalkyngel fra råte-sykdommene. Stikk inn en pinne i åpne, syke celler — ingen tråddtrekk (viktig for å utelukke AFB).',
  'Eliminere fuktighet og temperaturstress som trigger sporspiring. Hygienisk rase er den viktigste langsiktige forebyggingsfaktoren — bier som raskt fjerner syk yngel hindrer oppblomstring.',
  'Veterinærinstituttet, COLOSS BeeBook (2013), EFSA Scientific Opinion (2012)',
  'Close-up macro photograph of chalkbrood disease in an open honeybee comb. Chalk-white mummified larvae in hexagonal beeswax cells, some cells showing black spore-laden corpses. Golden-brown wax surrounding the cells, a few healthy glistening white larvae in adjacent cells for contrast. Natural diffused light, shallow depth of field, scientific documentary beekeeping photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Ascosphaera_apis_%28Maasen_ex_Claussen%29_L.S._Olive_%26_Spiltoir_1324048.jpg", "caption": "Ascosphaera apis — soppsporet som forårsaker kalkyngel", "bg": "#F8F8F8"},
    {"emoji": "⬜", "caption": "Hvite, kritt-aktige larver i åpne celler", "bg": "#F0F0F0"},
    {"emoji": "⬛", "caption": "Svarte kadavere ved sporulering — høy smitterisiko", "bg": "#FAF5E4"},
    {"emoji": "🏚️", "caption": "Flekkete yngelbilde — typisk mønster", "bg": "#F5F0EA"}
  ]'::jsonb,
  2
),

/* ──────────────────────────────────────────────────────
   3. EUROPEISK YNGELRÅTE
   ────────────────────────────────────────────────────── */
(
  'europeisk-yngelraate', 'Europeisk yngelråte', false, 'alvorlig',
  'Europeisk yngelråte (EFB) skyldes bakterien Melissococcus plutonius. Rammer åpen yngel, særlig under rask våroppvekst med temperatursvingninger og stress. Kan gi store tap av yngelrammer og kolonier.',
  'Gul til brun, myk og illeluktende yngel (sur melkelukter). Larvene dør i inngangen til cellen, ofte med vridd posisjon. Flekkete yngelbilde med tomme celler mellom frisk yngel.',
  'Oksytetrasyklinbehandling (veterinærpåkrevet i Norge). Dronningbytte og syklusbryting kan hjelpe i milde tilfeller. Forbedre koloniforhold og fjern stressfaktorer.',
  'Unngå stress på kolonien (sulting, trangboddhet). Bruk av hygieniske bier. Behandle med antibiotika kun etter veterinærdirektiv og resistenstest.',
  '[
    {"season": "Vår", "tips": [
      "EFB slår til oftest i mai–juni ved rask vekst og temperatursvingninger.",
      "Unngå under-mating og stress — sultne kolonier er langt mer sårbare.",
      "Syklusbryting med dronningbytte gir spontan helbredelse ved milde tilfeller."
    ]},
    {"season": "Sommer", "tips": [
      "Sterk sommerkolo bekjemper smittet yngel. Prioriter kolonibygging fremfor honningavl.",
      "Fjern angrepte rammer — ikke flytt dem til andre kuber eller apiarer."
    ]},
    {"season": "Høst", "tips": [
      "Bytt dronning til hygienisk rase. Sterk høstkoloni gir bedre vinterstart.",
      "Rens og desinfiiser (2 % NaOH) utstyr som har vært i kontakt med syke kuber."
    ]},
    {"season": "Vinter", "tips": [
      "God vinterforsyning (>20 kg mat) reduserer stressrelatert EFB neste vår.",
      "Hold journal over behandlede kuber og antibiotikum brukt — krav i Norge."
    ]}
  ]'::jsonb,
  'Gullgul–brungrå larve som er myk og illeluktende (sur melkelukter). Larven er vridd ut av sin normale C-form. Flekkete yngelbilde uten tråddtrekk. Pinnetest: ingen tråddtrekk (avgjørende for å skille fra AFB). Lab: send prøve til Veterinærinstituttet for PCR-bekreftelse av M. plutonius.',
  'Stoppe spredning i apiaret og gjenopprette kolonistyrken. Antibiotika er siste utvei — biotekniske tiltak (syklusbryting, dronningbytte, stressfjerning) foretrekkes og er tilstrekkelig i de fleste tilfeller.',
  'Mattilsynet, Veterinærinstituttet — EFB-veileder (2023), COLOSS BeeBook',
  'Macro photograph of European foulbrood (EFB) infected honeybee comb. Open brood cells showing yellowed twisted larvae in various stages of decomposition, some larvae with characteristic melted appearance lying in unusual positions. Healthy pearly-white larvae in adjacent cells for contrast. Warm golden wax background, natural light, shallow depth of field. Realistic beekeeping disease documentation photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/d/d8/European_foulbrood_CZ.jpg", "caption": "Europeisk yngelråte — gulfargede, misformede larver", "bg": "#FFFDE7"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/0/00/EFB_clinical_symptoms.jpg", "caption": "Kliniske symptomer på EFB i åpne celler", "bg": "#FFF8E1"},
    {"emoji": "🗺️", "caption": "Flekkete yngelbilde med tomme og fylte celler", "bg": "#FFF3E0"},
    {"emoji": "🔀", "caption": "Larver i vridd posisjon — karakteristisk for EFB", "bg": "#FBE9E7"}
  ]'::jsonb,
  3
),

/* ──────────────────────────────────────────────────────
   4. AMERIKANSK YNGELRÅTE
   ────────────────────────────────────────────────────── */
(
  'amerikansk-yngelraate', 'Amerikansk yngelråte', true, 'kritisk',
  'Amerikansk yngelråte (AFB) er forårsaket av Paenibacillus larvae og er den mest ødeleggende biysykdommen i verden. Sporene overlever i over 50 år og smitter alt utstyr som trevirke og voks. Meldepliktig i Norge.',
  'Forseglet yngel med innsunkne, misfargede lokk (kakebrun). Seig, tråddtrekkende masse med karakteristisk søtlig-råtten lukt. Tråddtrekk >2 cm ved pinnetest. Mørkfargede larverester som henger fast i cellbunnen.',
  'Ingen godkjent behandling i Norge. Kolonien og alt trevirke MÅ brennes. Metall og glass kan steriliseres med flamme eller Virkon. Mattilsynet MÅ varsles umiddelbart (22 40 00 00).',
  'Kjøp kun utstyr og pakker fra dokumenterte, godkjente kilder. Desinfiser alltid brukt utstyr med flamme. Meld all mistanke til Mattilsynet omgående.',
  '[
    {"season": "Vår", "tips": [
      "Inspiser forseglet yngel nøye i april–mai — se etter innsunkne, misfargede lokk.",
      "Ved MINSTE mistanke: kontakt Mattilsynet 22 40 00 00 UMIDDELBART. Ikke flytt noe.",
      "AFB-sporer overlever >50 år — alt trevirke fra smittet kube MÅ brennes på stedet."
    ]},
    {"season": "Sommer", "tips": [
      "Hold journal over kubenummer og plasseringer for å spore smittekjeden.",
      "Ikke kjøp brukt utstyr uten dokumentert AFB-fri historikk."
    ]},
    {"season": "Høst", "tips": [
      "Kjøp bare dronninger og pakker fra godkjente avlere med sertifisert AFB-kontroll.",
      "Desinfiiser all utstyr (fôrer, redskaper) mellom kuber i samme apiar."
    ]},
    {"season": "Vinter", "tips": [
      "Oppbevar tomme kaker med god luftsirkulasjon i tett rom — hindrer fukt.",
      "Registrer deg i Husdyrregisteret og hold kubejournal oppdatert (lovpålagt)."
    ]}
  ]'::jsonb,
  'Pinnetest: stikk en liten pinne i smittet celle — kaffebrun, seig masse som trekker i tråd >2 cm = POSITIV test for AFB. Karakteristisk søtlig-råtten lukt (likner karamell eller lim). Lokket er innsunket og mørkt, noen med et lite hull i midten. Lab: send prøve til Veterinærinstituttet for PCR-bekreftelse av P. larvae.',
  'AFB er meldepliktig i Norge. Det finnes ingen godkjent behandling — målet er total eradikering av smittede kuber for å hindre spredning i apiaret og regionen. Mattilsynet koordinerer og overvåker bekjempelsesaksjoner.',
  'Mattilsynet — Meldepliktige sykdommer hos bier, Veterinærinstituttet (2024), WOAH (OIE)',
  'Close-up macro photograph of American foulbrood infection in honeybee brood comb. Sunken, discolored dark brown wax cappings in characteristic pepper pot pattern, some cappings with small holes. Adjacent cell shows a matchstick inserted into the ropy chocolate-brown sticky mass being pulled in a long string. Healthy lighter-colored sealed brood cells nearby for contrast. Natural diffused light, scientific documentary style.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/e/e5/AFB_in_combs.jpg", "caption": "AFB i kaker — innsunkne lokk og mørke avleiringer", "bg": "#FFF8E1"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/9/93/Loque_americana.jpg", "caption": "Innsunkne lokk og seig tråddtrekksmasse", "bg": "#FFF3E0"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/2/24/Brood_Paenibacillus_larvae.jpg", "caption": "Yngel angrepet av Paenibacillus larvae", "bg": "#FBE9E7"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Fuocoarnia.JPG", "caption": "Brenning av kube — eneste løsning ved AFB-funn", "bg": "#FFEBEE"}
  ]'::jsonb,
  4
),

/* ──────────────────────────────────────────────────────
   5. SEKKYNGELVIRUS
   ────────────────────────────────────────────────────── */
(
  'sekkyngelvirus', 'Sekkyngelvirus', false, 'lav',
  'Sekkyngelvirus (SBV – Sacbrood virus) er et vanlig bievirus som normalt holder seg på et lavt nivå. Kraftige utbrudd er sjeldne. Viruset kombinert med høy varroa-belastning kan gi betydelige tap av yngel.',
  'Forseglet yngel med gule, posesekk-lignende larver fulle av gråbrun væske. Innsunkne lokk, noen med et lite hull. Tørkede, brun-svarte larver forblir i cellene i en karakteristisk gondol-form.',
  'Ingen spesifikk behandling. Sterk koloni bekjemper normalt viruset selv. Dronningbytte kan hjelpe ved vedvarende problemer. Fjern synlig syk yngel.',
  'Unngå stress. Varroabehandling reduserer sekundærinfeksjoner og gjør kolonie mer motstandsdyktig. Hygieniske bier fjerner sykt yngel raskt.',
  '[
    {"season": "Vår", "tips": [
      "SBV er mest synlig i april–juni. Sterk vårkoloni bekjemper normalt viruset selv.",
      "Fjern synlig syk yngel forsiktig for å redusere virusmengden i kuben.",
      "Kontroller at varroa holdes under kontroll — varroa forsterker SBV-utbrudd."
    ]},
    {"season": "Sommer", "tips": [
      "Dronningbytte kan redusere utbruddets intensitet ved vedvarende problemer.",
      "Unngå stressfulle inngrep (splitting, kraftig mating) under aktivt utbrudd."
    ]},
    {"season": "Høst", "tips": [
      "Sørg for sterk høstkoloni — utmattede bier er mer sårbare for virusinfeksjoner.",
      "God varroakontroll om høsten er viktigste tiltak mot SBV neste vår."
    ]},
    {"season": "Vinter", "tips": [
      "Ingen spesifikke tiltak mot SBV vinterstid.",
      "Fokuser på varroabehandling i desember–januar for å beskytte vinterbienes immunsystem."
    ]}
  ]'::jsonb,
  'Åpne celler med posesekk-formede larver fulle av gråbrun væske — karakteristisk og tydelig. Larvene dør vanligvis i pre-pupe-stadiet (inngangen til forseglet steg). Tørkede larver forblir i cellene i en karakristisk oppkrummet gondol-form. Lukt er mild og ikke like karakteristisk som råte-sykdommer.',
  'Holde varroa under kontroll er det viktigste tiltaket — det reduserer SBV-utbrudd og andre virusinfeksjoner. Sterk, ung koloni bekjemper vanligvis SBV uten videre tiltak.',
  'COLOSS BeeBook, Veterinærinstituttet, Bailey & Ball — Honey Bee Pathology (1991)',
  'Macro photograph of sacbrood virus (SBV) infected honey bee larva inside an opened hexagonal wax cell in brood comb. The pre-pupal larva is in characteristic curved sac-like form, yellowish-brown fluid clearly visible inside the slightly transparent larval cuticle. Surrounding cells show healthy white larvae for contrast. Natural warm light, extreme macro detail, scientific documentary photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/2/27/Sacbrood_BHL41830855.jpg", "caption": "Sekkyngelvirus — syke larver i kaker (USDA, offentlig eiendom)", "bg": "#FFFDE7"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/8/81/Sacbrood_%28Page_17%29_BHL41830850.jpg", "caption": "Typiske symptomer: posesekk-form og innsunkne lokk", "bg": "#F8F9FA"},
    {"emoji": "🧊", "caption": "Tørkede larveskal som forblir i cellene", "bg": "#F3F8FF"}
  ]'::jsonb,
  5
),

/* ──────────────────────────────────────────────────────
   6. NOSEMA
   ────────────────────────────────────────────────────── */
(
  'nosema', 'Nosema', false, 'moderat',
  'Nosema (Nosema apis og N. ceranae) er mikrosporie-infeksjoner i biers fordøyelseskanal. N. ceranae er nå den dominerende arten i norsk birøkt og kan gi stille koloninedgang uten tydelige ytre symptomer.',
  'Diare (brun flekkete front og fluktplate), unormalt mange bier som dør om vinteren og tidlig vår, svak og treg våroppvekst. N. ceranae gir ofte få synlige symptomer — svak koloni uten kjent årsak.',
  'Fumagillin er ikke godkjent i Norge. Dronningbytte og oppbygging av sterk sommerkoloni er beste tilnærming. Bytt ut gamle vokskaker med nytt voks regelmessig.',
  'Unngå lang vinterstid på gamle vokskaker. Sørg for god vinterforsyning av mat. Flytt kuber til tidlig blomstring om mulig — aktive bier tømmerne seg ute.',
  '[
    {"season": "Vår", "tips": [
      "Inspiser fluktplatene i mars–april for dysenteri (brun flekkete front og kasse-front).",
      "Gi stimuleringsfor tidlig for å fremme kolonivekst og fornyelse med unge bier.",
      "Flytt kuber til tidlig blomstrende plantefelt — aktive bier tømmerne tarmen ute."
    ]},
    {"season": "Sommer", "tips": [
      "N. ceranae gir sjelden synlige symptomer — bruk mikroskopi for bekreftelse ved mistanke.",
      "Bytt ut 2–3 av de eldste vokskakene hvert år — nosema-sporer akkumuleres i voks.",
      "Sterk sommerkoloni overvinnes smitte naturlig."
    ]},
    {"season": "Høst", "tips": [
      "Skift ut gamle, mørke vokskaker med nytt hvitt voks — sporer overlever vinteren i kaker.",
      "Sørg for god vinterforsyning (>20 kg) med høyt sukkerinnhold, ikke fortynnet sirup."
    ]},
    {"season": "Vinter", "tips": [
      "Tørr og rolig vinterplass reduserer stressbelastning på overvintrende bier.",
      "Unngå for tidlig vårinseksjon som bryter vinterklyngen og stresser kolonien."
    ]}
  ]'::jsonb,
  'Dysenteri (brun flekketing) på huskassen og fluktplaten om våren. Mikroskopi av 30 bier i 0,5 % K₂Cr₂O₇: runde/ovale sporer (4–7 µm) ved N. apis, litt mindre ved N. ceranae. PCR-analyse ved Veterinærinstituttet er eneste sikre artsbestemmelse. Svak koloni uten kjent årsak tidlig vår kan skyldes N. ceranae.',
  'Sikre god overvintring og tidlig våroppstart gjennom sterk høstkoloni og rene kaker. Kolonifornyelse med unge bier er viktigere enn kjemisk behandling.',
  'Veterinærinstituttet, EFSA Scientific Opinion on Nosema ceranae (2013), Higes et al. (2006)',
  'Close-up photograph of a honeybee hive entrance showing classic nosema dysentery symptoms. Brown fecal streaks on the white painted landing board and lower hive body exterior, some streaks running down the front. Early spring morning, natural light, dew on grass visible. A few adult bees crawling on the landing board looking weak. Realistic beekeeping documentary photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Consequences_of_Nosema_apis_infection_for_male_honey_bees_and_their_fertility_-_Figure_1.webp", "caption": "Nosema apis-infeksjon hos droner — forskningsbilde", "bg": "#F5F0FF"},
    {"emoji": "💩", "caption": "Brunflekkete front og fluktplate — tegn på dysenteri", "bg": "#FFF8E1"},
    {"emoji": "📉", "caption": "Kolonien krymper unormalt raskt tidlig vår", "bg": "#F0F4FF"}
  ]'::jsonb,
  6
),

/* ──────────────────────────────────────────────────────
   7. TROPILAELAPS
   ────────────────────────────────────────────────────── */
(
  'tropilaelaps', 'Tropilaelaps', true, 'kritisk',
  'Tropilaelaps (T. clareae og T. mercedesae) er asiatiske parasittmidd som er ikke er påvist i Norge. De er potensielt verre enn Varroa fordi de formerer seg raskere og ikke kan overleve yngelfri periode. Ethvert funn skal umiddelbart meldes til Mattilsynet.',
  'Lignende Varroa: misdannede vinger, svekket yngel, larver som dør i celler. Middet er mindre enn Varroa (1×0,6 mm mot 1,6×1,1 mm) og beveger seg langt raskere. Krever laboratoriebekreftelse.',
  'Ikke aktuelt i Norge. Ved mistanke: isolér kuben omgående og kontakt Mattilsynet (22 40 00 00) umiddelbart. Ikke flytt noe utstyr eller bier.',
  'Ikke importer bier eller utstyr fra Asia uten veterinærattest. Inspiser alltid importerte bier. Meld all mistanke til Mattilsynet umiddelbart.',
  '[
    {"season": "Vår", "tips": [
      "Tropilaelaps er ikke påvist i Norge — men kunnskap og årvåkenhet er avgjørende.",
      "Inspiser alltid importerte bier fra Asia, Midtøsten eller Afrika svært nøye.",
      "Ser midden mindre enn Varroa og beveger seg raskere? Kontakt Mattilsynet STRAKS."
    ]},
    {"season": "Sommer", "tips": [
      "Tropilaelaps formerer seg kun i forseglet yngel og er umulig å behandle med oksalsyre.",
      "Potensielt mer ødeleggende enn Varroa — kan doble populasjonen på kortere tid."
    ]},
    {"season": "Høst", "tips": [
      "Meld alle mistanker: Mattilsynet tlf. 22 40 00 00 — døgnvakt."
    ]},
    {"season": "Vinter", "tips": [
      "Ikke aktuelt per 2026 — funn ville utløse offentlig bekjempelsesprogram."
    ]}
  ]'::jsonb,
  'Tropilaelaps-midd er ca. 1×0,6 mm: MINDRE og mer ellipsoide enn Varroa (1,6×1,1 mm), og beveger seg MYE raskere på larver og bier. Smittet yngel viser like symptomer som Varroa. Krever laboratoriebekreftelse med stereolupe + PCR. Send straks prøve til Veterinærinstituttet ved mistanke.',
  'Tropilaelaps er en eksotisk karantenesykdom. Målet er å forhindre introduksjon via import og sikre umiddelbar oppdagelse og eradikering hvis funnet.',
  'WOAH (OIE) — Terrestrial Animal Health Code, EFSA Scientific Opinion on Tropilaelaps (2021), Mattilsynet',
  'Ultra-close macro photograph showing multiple Tropilaelaps mites on honey bee brood inside hexagonal wax cells. Several small elongated reddish-brown mites (clearly smaller and more elongated than Varroa) visible on pale honey bee larvae in different stages of development. Some larvae showing deformities. Scientific laboratory-quality macro photography, extreme detail, natural light.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/7/76/CSIRO_ScienceImage_7018_Asian_bee_mites_Tropilaelaps_sp_on_European_honey_bees_and_a_deformed_bee_top_left.jpg", "caption": "Tropilaelaps på honningbier — misdannet bie øverst til venstre (CSIRO)", "bg": "#FFF0F0"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/8/89/Apis_mellifera_larvae_infected_by_Tropilaelaps_mercedesae.png", "caption": "Apis mellifera-larver infisert av Tropilaelaps mercedesae", "bg": "#F0F8FF"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Brood_of_Apis_mellifera_infested_by_Tropilaelaps.png", "caption": "Yngel angrepet av Tropilaelaps — typisk skademønster", "bg": "#FFF5F5"},
    {"emoji": "🚨", "caption": "Mistanke? Ring Mattilsynet: 22 40 00 00", "bg": "#FFEBEE"}
  ]'::jsonb,
  7
),

/* ──────────────────────────────────────────────────────
   8. VOKSMØLL
   ────────────────────────────────────────────────────── */
(
  'voksmoell', 'Voksmøll', false, 'lav',
  'Voksmøll (stor: Galleria mellonella, liten: Achroia grisella) er møll som legger egg i kuber. Larvene ødelegger voks, yngeltrekk og propolis ved å grave silketunneler. Sterk koloni forsvarer seg selv — voksmøll er primært et problem i svake kuber og kakelageret.',
  'Grå, silkete tunneler og tråder gjennom voksen. Kremfarget larver med mørkt hode (opptil 20 mm). Yngeltrekket ser ut som ost (Swiss-cheese). Kokonger festet til kubevegger og rammestokker.',
  'Fjern og bren angrepte kaker. Frys tomme kaker (-18°C i 24–48 timer) for å drepe alle livsstadier — egg, larver, pupper og voksne. Rengjør kubekassen grundig.',
  'Hold sterke kolonier — svake kolonier klarer ikke å beskytte alt voksareal. Frys og lagre tomme kaker riktig. Tett alle sprekker i kuben og magasin. Fjern tomme supere biene ikke dekker.',
  '[
    {"season": "Vår", "tips": [
      "Kontroller kakelager fra vinterstid — voksmøll-egg kan allerede være lagt innendørs.",
      "Frys alle tomme kaker ved -18 °C i 24–48 timer for å drepe alle livsstadier.",
      "Pakk frossede kaker i tette plastsekker med lukking for langtidslaging."
    ]},
    {"season": "Sommer", "tips": [
      "Sterk koloni med full dekning av alle rammer er det beste forsvaret.",
      "Fjern tomme supere og mellomdeler som biene ikke dekker — reduserer angrepsflaten.",
      "Inspiser kakelager ukentlig i varme sommerperioder."
    ]},
    {"season": "Høst", "tips": [
      "Frys ALLE tomme kaker FØR langtidslaging. Pakk tett i plastsekker etter frysing.",
      "Kontroller kakelager nøye — larvene gnager raskt gjennom mange rammer."
    ]},
    {"season": "Vinter", "tips": [
      "Lagre kaker kaldt og tørt (under 10 °C hemmer utvikling). Tette beholdere er viktig.",
      "B401 (Bacillus thuringiensis) pulver mellom kakene er et biologisk alternativ til frysing."
    ]}
  ]'::jsonb,
  'Silkete hvite tunneler og tråder gjennom voks — karakteristisk skade. Kremfarget larver med brunt hode, opptil 20 mm. «Swiss-cheese»-mønster i yngeltrakter. Sterk koloni bekjemper normalt voksmøll — funn i sterk, sunn kube kan indikere annen underliggende svakhet.',
  'Beskytte kakelageret og sikre at kuben er sterk nok til å forsvare alt voksareal. Voksmøll er et symptom på svak koloni — styrk kolonien, løs grunnproblemet.',
  'Norges Birøkterlag — Skadevolderveileder (2022), Flottum — The Backyard Beekeeper',
  'Close-up macro photograph of greater wax moth (Galleria mellonella) larva damage inside a dark beeswax honeycomb. Silken white tunnels and webbing through the dark wax cells, a cream-colored larva with dark head partially visible inside a silk tunnel. Frass (droppings) and wax debris visible against golden-brown wax. Natural light, beekeeping documentary photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Galleria_mellonella_1.jpg", "caption": "Voksmøll (Galleria mellonella) — voksen", "bg": "#F8F8F8"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Fausse_teigne_%28larve%29.jpg", "caption": "Voksmølllarve som ødelegger kaken", "bg": "#F5F5F0"},
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Galleria_mellonella_cocoon%2C_grote_wasmot_cocon.jpg", "caption": "Kokonger festet til kubeveggen", "bg": "#FFFDE7"},
    {"emoji": "🕸️", "caption": "Silkete tunneler og tråder gjennom voksen", "bg": "#F8F8F8"}
  ]'::jsonb,
  8
),

/* ──────────────────────────────────────────────────────
   9. MAUR
   ────────────────────────────────────────────────────── */
(
  'maur', 'Maur', false, 'lav',
  'Maur (særlig skogmaur, Formica rufa, og svart maur, Lasius niger) invaderer kuber på jakt etter honning, propolis og varme. Sterke kolonier forsvarer seg selv, men svake kolonier kan bli overveldet og forlate kuben.',
  'Synlige maur inne i kuben, særlig i bunnbrettet og langs vegger. Bier som virker urolige og usamlet. Sporene langs kubebena er et tidlig tegn. Honningtap i svake kuber.',
  'Sett kuben på bein med maurskåler fylt med olje (matolje, linolje) eller vann. Rengjør omgivelsene rundt kubestandplassen for vegetasjon og løs bark.',
  'Bruk kubebein med feller. Ikke plasser kuber direkte på bakken. Fjern vegetasjon og løs bark rundt kubeunderlaget. Hold kubeplassen ryddig.',
  '[
    {"season": "Vår", "tips": [
      "Sjekk kubebena og underlaget tidlig i april — maurene er aktive fra april.",
      "Smør olje (matolje) rundt metallbena eller plasser kuben på bein med oljeskåler.",
      "Fjern all vegetasjon rundt bena — maur bruker gress og stikkelsbær som gangbro."
    ]},
    {"season": "Sommer", "tips": [
      "Klipp vegetasjon rundt kubestandplassen regelmessig — fjern alle naturlige broer.",
      "Sjekk oljeskålene månedlig og fyll opp — olje fordamper og regn fortynner."
    ]},
    {"season": "Høst", "tips": [
      "Tett eventuelle sprekker i kubekassene — spesielt i bunn og hjørnene.",
      "Svake høstkolonier er mest sårbare. Fokuser på å styrke kolonien, ikke bare bekjempe maur."
    ]},
    {"season": "Vinter", "tips": [
      "Maur overvintrer i bakken og er inaktive fra november.",
      "Forbered oljeskålene til bruk fra tidlig vår."
    ]}
  ]'::jsonb,
  'Synlige maur i og på kuben og bunnbrettet. Biene virker urolige med unormal aktivitet. Maurkolonier nær kubefundamentet — finn maurvegen og avskjær den. Sterk koloni klarer seg selv; bekymre deg mest for svake kuber.',
  'Maur er sjelden dødelige for sterke kuber. Målet er å gjøre kuben utilgjengelig via mekaniske barrierer, fremfor kjemiske midler som kan skade biene.',
  'Norges Birøkterlag — Praktisk birøkt (2022)',
  'Close-up macro photograph of wood ants (Formica species) at the entrance of a wooden beehive, attempting to enter through the bottom board opening. Several large red-black ants visible on the wooden landing board. Natural outdoor forest setting, green vegetation in background, natural morning light, shallow depth of field, ultra-realistic documentary photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Formica_rufa01.jpg", "caption": "Formica rufa (skogmaur) — en av artene som angriper svake kuber", "bg": "#FFF8E1"},
    {"emoji": "🫙", "caption": "Maurskåler med olje rundt kubeben", "bg": "#F0FFF4"},
    {"emoji": "🌿", "caption": "Vegetasjon rundt kuben gir maur adgang", "bg": "#F0F8F0"}
  ]'::jsonb,
  9
),

/* ──────────────────────────────────────────────────────
   10. MUS
   ────────────────────────────────────────────────────── */
(
  'mus', 'Mus', false, 'lav',
  'Husmus (Mus musculus) og skogmus (Apodemus sylvaticus) søker varme og mat i kuber fra september–oktober. De ødelegger kaker og forurenser kuben med urin og avføring, noe som stresser overvintrende kolonier og kan forårsake kollapss.',
  'Biter i voks, propolis og kubekasse. Museavføring (svarte 3–5 mm pellets) i bunnbrettet. Gnageskader langs rammen og kubevegger. Nestemateriale av gress og treverk. Urolig vinterklynge.',
  'Fjerning av musen med snapfeller plassert rundt kuben. Grundig rengjøring av kuben etter angrep — fjern all avføring og nestemateriale. Erstatt ødelagte rammer.',
  'Sett inn muserist (åpning maks 9–10 mm høyde) i flyåpningen ved innvintring (senest 1. oktober). Fjern all vegetasjon og løs bark rundt kubeplassen. Hold kubeplassen ren.',
  '[
    {"season": "Vår", "tips": [
      "Åpne kuben i mars–april og inspiser bunnbrettet nøye for skader og ekskrementer.",
      "Fjern all nestemateriale og rens grundig — museurin hindrer bienes renseferd.",
      "Vurder kakeutskifting ved store gnageskader — smittet voks kan forstyrre kolonien."
    ]},
    {"season": "Sommer", "tips": [
      "Mus er sjelden aktive i sterk koloni om sommeren.",
      "Sjekk ytterveggene og bunnstykket for mulige inngangspunkter og tett dem."
    ]},
    {"season": "Høst", "tips": [
      "Sett inn muserist ved innvintring (senest 1. oktober) — maks 9–10 mm høyde, 300 mm bredde.",
      "Kontroller at rist er sikret og ikke kan falle ut eller sparkes løs av biene.",
      "Plasser snapfeller rundt kuben fra september — mus søker overvintringssted tidlig."
    ]},
    {"season": "Vinter", "tips": [
      "Musegifter (rodenticider): IKKE i eller direkte ved kuben — biene kan komme i kontakt.",
      "Snapfeller rundt kuben er mest effektive og tryggeste metode.",
      "Kontroller museristen månedlig gjennom vinteren for is og isingsblokkering."
    ]}
  ]'::jsonb,
  'Gnageskader på voks og propolis er asymmetriske og grove. Museavføring (svarte, 3–5 mm lange pellets) i bunnbrettet er tydelig tegn. Sterk lukter av museurin fra kuben om våren er et alvorlig symptom. Vinterklyngen som ikke vil samle seg normalt etter urolig vinter.',
  'Forhindre museangrep med muserist satt inn FØR musene søker overvintringssted om høsten. En enkelt rist løser 99 % av problemet — dette er den enkleste og billigste forebyggingen i birøkt.',
  'Norges Birøkterlag — Innvintringsveileder (2024), Mattilsynet',
  'Documentary photograph of a beehive interior opened in early spring showing mouse damage. Gnawed and partially destroyed dark beeswax comb cells with characteristic irregular bite marks. Scattered mouse droppings (small dark pellets) visible on the bottom board. Scraps of dry grass and plant material used as nesting in one corner. Some intact honey cells still sealed. Natural spring light. Realistic beekeeping damage assessment photography.',
  '[
    {"uri": "https://upload.wikimedia.org/wikipedia/commons/0/0c/House_mouse_%28Mus_musculus%29_2808.jpg", "caption": "Husmus (Mus musculus) — søker varme og mat i kuber om vinteren", "bg": "#F8F8F8"},
    {"emoji": "🕳️", "caption": "Gnageskader på kubekasse og kaker", "bg": "#F5F0E8"},
    {"emoji": "🔒", "caption": "Muserist i flyåpning — maks 9–10 mm høyde", "bg": "#F0F8FF"}
  ]'::jsonb,
  10
);
