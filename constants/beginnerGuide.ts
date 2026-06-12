export interface GuideArticle {
  slug: string;
  title: string;
  emoji: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'kom-i-gang',
    title: 'Kom i gang som birøkter',
    emoji: '🐝',
    intro: 'Alt du trenger å vite før du setter opp din første bikube.',
    sections: [
      {
        heading: 'Hvorfor birøkt?',
        body: 'Birøkt er en spennende hobby som bidrar til pollinering av planter og natur i nærmiljøet. Du trenger ikke store arealer — mange birøktere holder bier i hager, på tak eller utenfor byer. En godt stelt kube kan gi 10–30 kg honning per år.',
      },
      {
        heading: 'Lover og regler',
        body: 'I Norge må alle bikuber registreres i Mattilsynets register (Husdyrregisteret). Dette er gratis og tar noen minutter. Du må også varsle naboer dersom du setter opp kuber nær boligområder. Sjekk med kommunen om det er lokale regler.',
      },
      {
        heading: 'Kurs er lurt',
        body: 'Norges Birøkterlag og lokale birøkterlag tilbyr kurs for nybegynnere. Et grunnkurs gir deg praktisk erfaring med bienes atferd, utstyr og stell gjennom en sesong. Mange kurs inkluderer tilgang til en veileder-kube det første året.',
      },
      {
        heading: 'Første sesong',
        body: 'Det beste tidspunktet å starte er tidlig vår (april–mai), enten med et kjøpt bifolk (nucleus) eller et sverm. Det første året handler mest om å lære bienes rytme — produksjon av honning kommer gjerne i år to.',
      },
      {
        heading: 'Plassering av kuben',
        body: 'Sett kuben i sol (helst morgensol fra øst), ly for vind, og med innflygningsåpningen vendt mot sør eller øst. Ha en vannkilde i nærheten — biene trenger vann daglig. Hold minst 3 meter til nabogjerde og sørg for at trekklinjen ikke går over sitteplasser.',
      },
      {
        heading: 'Kostnader for å starte',
        body: 'Regn med 5 000–8 000 kr for det første utstyret: kube (1 500–3 000 kr), drakt og hanske (500–1 500 kr), røykapparat og bistikke (400–800 kr), og ett bifolk eller sverm (800–1 500 kr). Mange birøkterlag låner ut slynge og annet sesongavhengig utstyr gratis til medlemmer.',
      },
      {
        heading: 'Birase',
        body: 'Buckfast er den vanligste rasen i Norge — rolig, produktiv og svermfattig. Carnica (grå bi) er mild og vinterherdig. Norsk landrase er tilpasset norsk klima og blomstring. Kjøp bier fra en godkjent avler i ditt fylke — lokalt tilpassede bier klarer seg best.',
      },
      {
        heading: 'Tid og innsats',
        body: 'Forventes ca. 30 minutter per kube per uke i sesong, mer i mai–juni (svermesesongen). August krever tid til varroa-behandling og fôring. Vintermånedene er rolige — en kort sjekk av innflygningen er som regel nok. To kuber tar ikke dobbelt så lang tid som én.',
      },
    ],
  },
  {
    slug: 'velge-kube',
    title: 'Velge riktig bikubetype',
    emoji: '🏠',
    intro: 'Det finnes flere kubetyper — her er forskjellene og hva som passer for deg.',
    sections: [
      {
        heading: 'Langstroth-kube',
        body: 'Den vanligste kubetypen i verden og anbefales for nybegynnere. Standardiserte mål gjør at rammer og utstyr er lett tilgjengelig. Kuben består av en bunne, yngelrom, en eller flere honningrom (magasiner), og et tak. Enkel å inspisere og utvide.',
      },
      {
        heading: 'Warré-kube',
        body: 'En mer naturlig kube med kvadratiske kasseenheter. Bienes treklubbe henger fra toppen og kuben utvides nedover. Krever noe færre inngrep enn Langstroth, men er vanskeligere å inspisere grundig. Populær blant birøktere som ønsker et mer naturorientert stell.',
      },
      {
        heading: 'Toppstang-kube (Top Bar Hive)',
        body: 'En lang, horisontal kube uten rammer — biene bygger ned fra stenger. Rimelig å bygge selv, og skånsom for biene. Lavere honningutbytte enn Langstroth fordi voks ikke kan slynges. Mest brukt i varmere land, men finnes hos norske hobbyrøktere.',
      },
      {
        heading: 'Hva bør du velge?',
        body: 'Velg Langstroth hvis du vil ha tilgang til mye kunnskap, kurs og standardutstyr. Velg Warré eller toppstang om du er opptatt av bienes naturlige atferd og vil gjøre færre inngrep. Uansett type: start med én kube og lær deg den godt før du utvider.',
      },
      {
        heading: 'Materialer og kvalitet',
        body: 'Gran og furu er vanligst — begge holder godt om de er malt eller oljet utvendig. Velg minst 22 mm tykkelse for isolasjon. Unngå trykkimpregnert tre innvendig — kjemikaliene er skadelige for biene. Plast-kuber finnes og er lette å rengjøre, men gir dårligere isolasjon.',
      },
      {
        heading: 'Ny vs. brukt kube',
        body: 'Brukte kuber er billige, men kan skjule sykdom — spesielt amerikansk yngelråte (AFB) som overlever tiår i voks og tre. Krev alltid friskmelding fra selger. Skrap av alt gammelt voks og flambér innvendig med gassbrenner før bruk. Ny kube er tryggere for nybegynnere.',
      },
      {
        heading: 'Antall kuber å starte med',
        body: 'Start med to kuber. Med to kan du sammenligne atferd, flytte rammer mellom dem for å styrke en svak koloni, og lære mye raskere enn med én. Hadde du bare én kube og den dør, er sesongen over. To er også minimum for å ta opp dronningoppdrett senere.',
      },
    ],
  },
  {
    slug: 'utstyr',
    title: 'Utstyr du trenger',
    emoji: '🧤',
    intro: 'En oversikt over alt du trenger for å starte — og hva som kan vente.',
    sections: [
      {
        heading: 'Beskyttelsesutstyr',
        body: 'Birøkterdrakt eller jakke med hette og netting er det viktigste du kjøper. Gode hansker er nyttig for nybegynnere, men mange erfarne birøktere jobber uten. Velg lyse farger — bier er mer aggressive mot mørke farger.',
      },
      {
        heading: 'Røykapparat',
        body: 'Røyk roer biene og er uunnværlig ved inspeksjoner. Kjøp et solid røykapparat av stål med blas. Brenn naturlige materialer som treull, pappremser eller tørket mose — unngå syntetiske materialer.',
      },
      {
        heading: 'Bistikke (hive tool)',
        body: 'En flat metallspak brukt til å løsne rammer og kubekasser som biene har limt med propolis. Kjøp minst to — de forsvinner lett! J-typen er populær for å løfte rammer, flat type for å skrape propolis.',
      },
      {
        heading: 'Slynge og voksutstyr',
        body: 'En honningslynge trenger du ved høsting — disse kan leies hos birøkterlaget det første året. Avdekningskniv eller -gaffel brukes til å fjerne vokslokket fra honningkakene. Vent gjerne med å kjøpe dette til du vet du vil fortsette.',
      },
      {
        heading: 'Hva kan vente',
        body: 'Dronningoppdrett-utstyr, feromonfeller, og merking av dronninger er ting du kan lære deg når du har hatt bier i ett par sesonger. Start enkelt.',
      },
      {
        heading: 'Vekt og journal',
        body: 'En kubevekt (manuell eller digital) gir deg innsikt i trekkstyrken uten å åpne kuben. Vekten stiger raskt under god blomstring og synker under dårlig vær. BiVokter-appen lar deg logge vekt, behandlinger og inspeksjonsfunn — alt samlet på ett sted.',
      },
      {
        heading: 'Dronningmerking',
        body: 'Merk dronningen med farget markeringstusj (POSCA eller BUKI-kit) etter et internasjonalt fargesystem: hvit (år som slutter på 1/6), gul (2/7), rød (3/8), grønn (4/9), blå (5/0). En merket dronning er langt lettere å finne under inspeksjon og du ser raskt om kolonien har byttet dronning.',
      },
      {
        heading: 'Varroa-overvåkingsutstyr',
        body: 'Klebbplate (festes under varroanettet, telles etter 48 timer) gir naturlig fall. Alkoholvask er mer nøyaktig: 300 bier i 70% isopropanol, rist og tell bunnfall. Refraktometer brukes til å måle vanninnhold i honning (under 18% = moden). Alle disse er rimelige og viktige verktøy.',
      },
    ],
  },
  {
    slug: 'aarshjul',
    title: 'Birøktens årshjul',
    emoji: '📅',
    intro: 'Bienes år følger naturens rytme — her er hva du gjør måned for måned.',
    sections: [
      {
        heading: 'Vinter (des–feb)',
        body: 'Biene er i vinterklubbe og lever av honning de har lagret. Forstyrrelser holdes på minimum. Sjekk at innflygningsåpningen ikke er tett av snø eller døde bier. Tenk over forrige sesong og planlegg neste.',
      },
      {
        heading: 'Tidlig vår (mar–apr)',
        body: 'Kolonien begynner å vokse raskt. Første inspeksjon gjøres en varm dag (over 12°C) for å sjekke dronning, yngel og matforråd. Tilsett fôr (sukkerlake 1:1) hvis det er lite honning igjen.',
      },
      {
        heading: 'Sen vår / forsommer (mai–jun)',
        body: 'Birøktens travleste periode. Svermesesongen er i gang — inspiser ukentlig for å hindre sverming. Sett på honningrom når yngelrommet er nesten fullt. Varroa-kontroll er viktig nå.',
      },
      {
        heading: 'Høysesong (jul–aug)',
        body: 'Høsting av honning skjer typisk i juli og august. Slyngning, siling og tapping. Etter høsting: varroa-behandling er kritisk for at kolonien skal gå sterk inn i vinteren.',
      },
      {
        heading: 'Høst (sep–okt)',
        body: 'Kolonien krymper. Sikre tilstrekkelig vinterforråd — minst 15–20 kg honning per kube. Mus-sperre settes på innflygningsåpningen. Siste varroa-kontroll.',
      },
      {
        heading: 'November og desember',
        body: 'Kolonien er i vinterklubbe og skal ikke forstyrres. Sjekk at innflygningsåpningen ikke er sperret av snø eller døde bier. Bruk vinteren til å lese fagstoff, bestille utstyr til neste sesong, og smelte om gammelt voks. BiVokter-appen viser historikk fra sesongen.',
      },
      {
        heading: 'Løpende registrering',
        body: 'Skriv alltid ned dato, vær, hva du observerte og hva du gjorde etter hver inspeksjon. Noter antall rammer med yngel, honning, om du fant dronningen, og eventuelle tegn på sykdom. Et godt journalføringssystem gjør at du husker hva som skjedde — og lærer raskere.',
      },
    ],
  },
  {
    slug: 'dronning-og-koloni',
    title: 'Dronningen og kolonien',
    emoji: '👑',
    intro: 'Forstå hierarkiet i kuben — hvem gjør hva, og hvorfor dronningen er så viktig.',
    sections: [
      {
        heading: 'Dronningen',
        body: 'Kolonien har én dronning og hun er den eneste som legger befruktede egg. En god dronning kan legge 1 500–2 000 egg per dag i toppsesongen. Hun lever 3–5 år, men de fleste birøktere bytter dronning hvert 1–2 år for å sikre god genetikk og produktivitet.',
      },
      {
        heading: 'Arbeiderbiene',
        body: 'Alle arbeiderbier er hunner og utgjør 95–99% av kolonien. En sommerbie lever bare 6 uker — de første tre som "husbie" (mate larver, bygge voks, vokte inngangen), og deretter som samlingsbie. Vinterbier lever 4–6 måneder.',
      },
      {
        heading: 'Droner',
        body: 'Droner er hannbier og har én oppgave: paring med dronninger fra andre kolonier. De har ingen brodd og gjør ikke husarbeid. Om høsten, når ressurser er knappe, jager arbeiderbiene dronene ut av kuben.',
      },
      {
        heading: 'Sverming',
        body: 'Sverming er bienes naturlige formeringsmetode. Halvparten av kolonien forlater kuben med den gamle dronningen og danner en sverm. For birøkteren betyr det halvert styrke og tapt honningpotensial. Regelmessige inspeksjoner og svermforebygging (f.eks. kunstig sverming) er viktig.',
      },
      {
        heading: 'Kommunikasjon',
        body: 'Bier kommuniserer gjennom feromoner og dans. Vrikkedansen forteller retning og avstand til matkilder. Alarmferomonet (fra broddapparatet) er grunnen til at ett stikk kan utløse flere — hold roen og bruk røyk for å maskere det.',
      },
      {
        heading: 'Dronningskifte',
        body: 'Bytt dronning hvert 1–2 år for å opprettholde produktivitet og redusere svermtilbøyelighet. Ung dronning legger mer egg og kolonien er mer stabil. Kjøp dronning fra godkjent avler med dokumentasjon. Introduser forsiktig via introduksjonsbur med sukkerplugg — kolonien aksepterer henne gradvis.',
      },
      {
        heading: 'Dronningløs koloni',
        body: 'Tegn på at kolonien mangler dronning: ingen ferskt egg eller ungt yngel, biene er urolige og støyende, og du kan se droneyngel lagt av leggarbeidere (ujevne celler, mange droner). Handle raskt: tilsett en ny dronning, en ramme med ferskt egg, eller slå kolonien sammen med en sterk nabo.',
      },
      {
        heading: 'Å finne dronningen',
        body: 'Se ytterst på rammen og langs bunnen — dronningen trekker seg bort fra lys og bevegelse. Se etter en ring av arbeiderbier rundt henne (hoffstaten). Dronningen er lengre og smalere enn en drone, med kortere vinger relativt til kroppen. En merket dronning er langt lettere å finne.',
      },
    ],
  },
  {
    slug: 'honning-hosting',
    title: 'Honning-høsting',
    emoji: '🍯',
    intro: 'Når er honningen klar, og hvordan høster du riktig?',
    sections: [
      {
        heading: 'Når er honningen moden?',
        body: 'Biene legger lokk av voks over moden honning. En ramme er klar når minst 80% av cellene er forseglet. Du kan også sjekke med refraktometer — moden honning har under 18% vanninnhold. For høy fuktighet gir gjæring og sur honning.',
      },
      {
        heading: 'Fjerne biene fra magasinet',
        body: 'Bruk fluktplan (under magasinet natten før), blåsebil (motor som blåser biene ned), eller børst ramme for ramme. Unngå å bruke for mye røyk under høsting — det påvirker smaken. Arbeid rolig og effektivt.',
      },
      {
        heading: 'Avdekning og slyngning',
        body: 'Avdekk cellene med en varm avdekningskniv eller gaffel. Legg rammene i slynga — maks 2/3 fulle for å unngå overbelastning. Slyngning tar 5–10 min per omgang. La honningen renne gjennom sil (300–600 mikron) for å fjerne voksbiter.',
      },
      {
        heading: 'Modning og tapping',
        body: 'La honningen modne i en modningsbeholder (rustfritt eller matgodkjent plastbeholder) i 1–2 dager. Skum av luftbobler på toppen. Tap på glass mens honningen er flytende — venter du, krystalliserer den og er vanskelig å tappe.',
      },
      {
        heading: 'Lagring og merking',
        body: 'Honning holder seg i praksis evig om den oppbevares mørkt og kjølig (under 20°C). Unngå direkte sollys og temperaturer over 40°C (ødelegger enzymer). Norsk lov krever merking med innhold, vekt, og produsent dersom du selger.',
      },
      {
        heading: 'Hygiene og utstyr',
        body: 'Alt utstyr som kommer i kontakt med honning må være mattgodkjent (rustfritt stål eller matplast). Vask med varmt vann — ikke såpe, det setter smak. Slyngrommet skal være bifritt og vindtett for å unngå at rovbier oppdager honningen. Renhet er viktig for smak og holdbarhet.',
      },
      {
        heading: 'Lovkrav ved salg',
        body: 'Produserer du under 3 000 kg/år, regnes du som primærprodusent og kan selge direkte uten full næringsmiddelregistrering. Over dette kreves registrering hos Mattilsynet. Uansett volum: merking med produsent, nettovekt, "best før"-dato og opprinnelsesland er obligatorisk ved salg.',
      },
      {
        heading: 'Krystallisering',
        body: 'Krystallisering er naturlig og et tegn på ekte honning. Kløverhonning krystalliserer på noen uker, lynghonning nesten umiddelbart, mens akasiehonning kan holde seg flytende i måneder. Varm forsiktig opp (maks 40°C i vannbad) for å gjøre den flytende igjen — over 40°C ødelegges enzymer.',
      },
    ],
  },
  {
    slug: 'varroa-kontroll',
    title: 'Varroa-kontroll',
    emoji: '🔬',
    intro: 'Varroa er den største trusselen mot bier i Norge — slik holder du den i sjakk.',
    sections: [
      {
        heading: 'Hva er varroa?',
        body: 'Varroa destructor er en liten ektoparasitt (ca. 1,5 mm) som lever på bier og larver. Den suger hemolymfe (bienes "blod") og overfører virus, særlig deformert vingevirus (DWV). Ubehandlet koloni dør normalt i løpet av 2–3 år.',
      },
      {
        heading: 'Telling og overvåking',
        body: 'Telle varroa på nattefallet (klebbplate under varroanett, telles etter 24–48 timer) eller via alkoholvask av 100–300 bier. Under 1 varroa per 100 bier = lavt nivå. Over 3 per 100 bier = behandling nødvendig. Tell minst 3 ganger per sesong.',
      },
      {
        heading: 'Behandlingsmetoder',
        body: 'Godkjente midler i Norge: oksalsyre (mest vanlig, brukes vinterstid uten yngel), maursyre (effektiv sommerbehandling, krever temperatur 15–25°C), og timol (ApiLife VAR). Alle midler er kun effektive mot varroa på biene — ikke i forseglet yngel.',
      },
      {
        heading: 'Yngelstans-metoden',
        body: 'Ved å stenge dronningen i et bur i 21 dager oppstår yngelstans — all yngel klekkes og varroaen er eksponert. Deretter behandles med oksalsyre og effekten er nær 99%. Kombinert teknikk anbefalt av Mattilsynet for høy effektivitet.',
      },
      {
        heading: 'Resistens og samarbeid',
        body: 'Varroa utvikler ikke resistens mot oksalsyre eller maursyre (naturlige syrer). Bruk godkjente midler og bytt ikke mellom ulike midler unødig. Snakk med nabobirøktere — varroa sprer seg mellom kolonier, og koordinert behandling i området gir best effekt.',
      },
      {
        heading: 'Oksalsyre i praksis',
        body: 'Drypp-metoden: 3–5 ml ferdig løsning (3,5% oksalsyre i sukkerlake) per biegang mellom rammene. Brukes kun uten yngel (desember–januar). Fordamping (Varrox-apparat): 2,1 g oksalsyre-dihydrat per kube, kan brukes med noe yngel. Bruk alltid vernemaske (FFP2) og hansker — oksalsyre er etsende.',
      },
      {
        heading: 'Biavl mot varroa',
        body: 'VSH-bier (Varroa Sensitive Hygiene) renser aktivt varroa fra forseglet yngel og kan redusere behovet for kjemisk behandling. Norsk Genressurssenter og godkjente avlere arbeider med å utvikle varroa-resistente linjer. Velg lokalt avlede bier som er testet mot varroa i norsk klima.',
      },
    ],
  },
  {
    slug: 'foring',
    title: 'Fôring av bier',
    emoji: '🍬',
    intro: 'Når, hva og hvordan du fôrer biene — uten å gjøre mer skade enn nytte.',
    sections: [
      {
        heading: 'Når er fôring nødvendig?',
        body: 'Biene trenger fôr når de har for lite honningforråd til å overleve: tidlig vår (mars–april) hvis vinterforrådet er tomt, etter en honninghøsting der det er tatt for mye, eller om sommeren ved langvarig dårlig vær som hindrer blomstringer.',
      },
      {
        heading: 'Sukkerlake til energi',
        body: 'Sukkerlake (sukker og vann) er standardfôr. Tynn lake (1:1, sukker:vann) om våren stimulerer egglegging. Tykk lake (2:1) om høsten bygger opp vinterforråd raskt. Bruk vanlig hvitt sukker — unngå brunt sukker, honning fra ukjent kilde, og kunstige søtningsmidler.',
      },
      {
        heading: 'Proteinpollen-erstatning',
        body: 'Biene trenger protein (pollen) for å fø larver. Om våren, når naturlig pollen mangler, kan pollenerstatter (kjøpes i birøkterbutikker) gis som deig direkte på topplistene. Bruk ikke rå pollen fra ukjent kilde — det kan spre sykdom.',
      },
      {
        heading: 'Fôringsmetoder',
        body: 'Fôringsrenne (over rammene), bøttematere (plassert over hull i toppliste), eller posematere (plastpose med hull). Bøttematere er praktiske og holder mye. Unngå å søle sukkerlake utenfor kuben — det lokker til seg rovbier og skaper kamp.',
      },
      {
        heading: 'Hva du ikke skal gjøre',
        body: 'Gi aldri ubehandlet honning fra ukjent kilde — det kan overføre amerikansk yngelråte (AFB). Gi ikke melk, juice eller annen mat. Fôr alltid om kvelden for å unngå røveri. Slutt å fôre i god tid før honninginnsamlingen begynner om våren.',
      },
      {
        heading: 'Aminosyretilskudd',
        body: 'Produkter som Amino-B Booster blandes i sukkerlaken og supplerer proteiner ved dårlig pollentilgang. Nyttig tidlig vår eller under langvarig regnvær. Ikke nødvendig med rik naturlig blomstring. Les dosering nøye — for mye gir ikke bedre effekt og er bortkastet penger.',
      },
      {
        heading: 'Planter for biene',
        body: 'Phacelia, bokhvete og kløver er enkle å så og gir rik nektarproduksjon. Raps og lind gir store trekktopper på forsommeren. Frukttrær, bringebær og solsikke er verdifulle om våren og sommeren. Snakk med naboer og lokale bønder om å plante biprodusentplanter — alle vinner på det.',
      },
    ],
  },
  {
    slug: 'svermforebygging',
    title: 'Svermforebygging',
    emoji: '🌀',
    intro: 'Svermesesongen er birøkterens mest krevende periode — her er hvordan du håndterer den.',
    sections: [
      {
        heading: 'Hvorfor svermer bier?',
        body: 'Sverming er bienes naturlige formeringsmåte. En koloni svermer vanligvis når: yngelrommet er fullt, det er mye bier og lite plass, eller kolonien er i god vekst på forsommeren. Alder på dronningen, genetikk og været påvirker svermtilbøyeligheten.',
      },
      {
        heading: 'Svermceller — varseltegn',
        body: 'Inspiser ukentlig i mai–juni for svermceller. De lages langs kanten og bunnen av rammen, og ligner en peanøtt. Finnes en ferdig lukket dronningcelle uten åpen nok celle — kolonien har sannsynligvis allerede svermet. Åpne celler gir deg fremdeles tid.',
      },
      {
        heading: 'Kunstig sverming',
        body: 'Enkleste forebygging: del kolonien i to. Flytt dronningen med 3–4 rammer bier og yngel til en ny kube. La svermcellene i den gamle kuben klekke ny dronning. Begge kolonier tror de har svermet og sverminstinktet avtar. Begge kan vokse seg sterke.',
      },
      {
        heading: 'Andre svermforebyggingsmetoder',
        body: 'Gi mer plass (legg på ekstra kasse) før det er fullt. Klipp svermceller — men vær konsekvent, én oversett celle og kuben svermer. Bytte dronning til ung dronning av svermfattig rase (f.eks. Buckfast). Avl på kolonier som sjelden svermer.',
      },
      {
        heading: 'Fange et sverm',
        body: 'Et sverm som henger i et tre er rolig og ufarlig — biene har ingen yngel å forsvare. Rist svermen ned i en svermkasse eller kube. Pass på at dronningen er med — da blir de fleste biene. Plasser kassen med innflygning mot kvelden. Sjekk etter 3 dager om de er blitt.',
      },
      {
        heading: 'Hva gjør du om kuben allerede har svermet?',
        body: 'Finn dronningcellene. Åpen celle: svermen har ikke forlatt ennå — kuben kan reddes. Lukket eller klekket celle: svermet er sannsynligvis borte. La den sterkeste cellen stå og fjern resten forsiktig. Ny dronning er kjønnsmoden etter 5–7 dager, legger egg etter 3–4 uker. Ikke åpne kuben i mellomtiden.',
      },
      {
        heading: 'Svermkasse og svermfangst',
        body: 'En tom, mørk kasse med noen biter gammelt kakestykke og litt propolis på innerveggen lokker til seg frittliggende sverm. Sett den opp 2–3 meter over bakken i kanten av hagen tidlig i mai. Sjekk ukentlig. Har du fanget en sverm, flytt kassen til fast plass om natten når alle biene er inne.',
      },
    ],
  },
  {
    slug: 'biprodukter',
    title: 'Bivoks og biprodukter',
    emoji: '✨',
    intro: 'Honning er ikke det eneste biene lager — her er hva du kan bruke fra kuben.',
    sections: [
      {
        heading: 'Bivoks',
        body: 'Arbeiderbiene skiller ut bivoks fra kjertelene på buken og bruker det til å bygge kamstruktur. Voks smeltes ut fra avdekkingsvoks og gamle rammer. Filtrert bivoks brukes til lys, kosmetikk, trevoks og skifors. En kube gir 0,5–1 kg ren voks per år.',
      },
      {
        heading: 'Propolis',
        body: 'Biene samler harpiks fra trær og bearbeider den til propolis — et antibakteriellt "kitt" brukt til å forsegle kuben og sterilisere overflater. Propolis skrapes av med bistikken. Brukes i kosmetikk, tinktur og medisin. Har dokumentert antibakteriell effekt.',
      },
      {
        heading: 'Pollen',
        body: 'Pollensamlere kan plasseres i innflygningsåpningen for å høste pollen. Pollen er rikt på protein, vitaminer og mineraler, og selges som kosttilskudd. Høst i max 2–3 dager av gangen — kolonien trenger pollen for å fø larver. Tørk pollen og oppbevar frossent.',
      },
      {
        heading: 'Gelé royale',
        body: 'Gelé royale er mat produsert av unge arbeiderbier for å fø larver og dronningen. Produksjon krever at man fjerner unge larver og lager kunstige dronningceller. Krevende prosess — anbefales kun for erfarne birøktere. Høy etterspørsel og god pris.',
      },
      {
        heading: 'Honningtyper',
        body: 'Honningens smak og farge bestemmes av nektarkildene. Norsk skogshonning (fra bladlussekresjon på gran og furu) er mørk og kraftig. Kløverhonning er lys og mild. Lynghonning er geleaktig og aromatisk. Variasjonen er stor mellom år og lokasjon.',
      },
      {
        heading: 'Smelte og rense voks',
        body: 'Smelt gammel voks i vannbad — aldri direkte på platen, brannsfare. Sil gjennom en nylonstrømpe mens voksen er flytende. Hell i former og la avkjøle sakte. Urenheter (propolis, kakebiter) synker til bunns og skjæres av når voksen er stivnet. Ren voks er gul og uten fremmedstoffer.',
      },
      {
        heading: 'Salve og kosmetikk',
        body: 'En enkel bivokssalve lages av 30 g smeltet bivoks, 100 ml jomfruolje (oliven eller mandelolje), og evt. 10 dråper eterisk olje (lavendel eller propolis-tinktur). Bland ved 70°C, hell i glass og la stivne. Populært som leppebalsam, håndsalve eller sårsmøring — og enkelt å selge lokalt.',
      },
    ],
  },
  {
    slug: 'vinterforberedelse',
    title: 'Vinterforberedelse',
    emoji: '❄️',
    intro: 'En god vinter starter med god forberedelse i august og september.',
    sections: [
      {
        heading: 'Vinterforråd',
        body: 'En koloni trenger 15–20 kg honning for å overleve norsk vinter. Sjekk alltid forrådet etter høsting i august. Er det under 10 kg, fôr med tykk sukkerlake (2:1) inntil biene ikke tar mer — gjerne innen 1. oktober. Sultvinter er den vanligste årsaken til at kolonier dør.',
      },
      {
        heading: 'Varroa-behandling etter høsting',
        body: 'Den viktigste behandlingen i hele året skjer etter høsting, før biene slutter å lage vinterbi. Bruk oksalsyre (drypp eller fordamping) etter yngelstans, eller maursyre om det fortsatt er yngel. Mål varroa-nivå 3–4 uker etter behandling.',
      },
      {
        heading: 'Tilpasse kuben for vinteren',
        body: 'Fjern tomme honningrom — kolonien overvintrer bare i yngelrommet. Sett på mussperre (gitterrist i innflygningsåpningen). Sørg for lufting i toppen av kuben for å unngå kondensasjon. Bier dør av fuktighet, ikke kulde.',
      },
      {
        heading: 'Kolonisammenslåing',
        body: 'Svake kolonier uten god dronning bør slås sammen med en sterk koloni fremfor å la dem gå inn i vinteren alene. Bruk avislsmetoden (ett ark avispapir mellom kolonigruppene) — innen 2–3 dager har de akseptert hverandre og drept den svakeste dronningen.',
      },
      {
        heading: 'Vinteren er over',
        body: 'Første tegn på liv om våren er samlingsaktivitet en varm dag (over 10°C). Første inspeksjon gjøres når temperaturen er over 12°C inne i kuben. Se etter yngel, dronning og matforråd. Topp opp med fôr om nødvendig og glede deg — en ny sesong begynner!',
      },
      {
        heading: 'Beskytte mot vind og vær',
        body: 'Plasser kuben med innflygningsåpningen mot sør eller øst — morgensol varmer opp kolonien og stimulerer aktivitet. Bruk vindspjeld av halmballer, planker eller busker på nordsiden. Løft kuben 20–30 cm over bakken på klosser eller stativ — fukt fra bakken er en vanlig årsak til vinterdød.',
      },
      {
        heading: 'Bruk vinteren til læring',
        body: 'Delta på kurs hos ditt lokale birøkterlag — mange arrangerer teorikurs og foredrag i vinterhalvåret. Les fagbøker (f.eks. "Birøkt i Norge" av Terje Reinertsen). Følg norske birøktere på YouTube og Facebook. Planlegg neste sesongsopplegg, varroa-strategi og hva du vil forbedre — og noter det i BiVokter-appen.',
      },
    ],
  },
];
