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
        body: 'Birøktens travleste periode. Svermesesongen er i gang — inspiser ukentlig for å hindre svirming. Sett på honningrom når yngelrommet er nesten fullt. Varroa-kontroll er viktig nå.',
      },
      {
        heading: 'Høysesong (jul–aug)',
        body: 'Høsting av honning skjer typisk i juli og august. Slyngning, siling og tapping. Etter høsting: varroa-behandling er kritisk for at kolonien skal gå sterk inn i vinteren.',
      },
      {
        heading: 'Høst (sep–okt)',
        body: 'Kolonien krymper. Sikre tilstrekkelig vinterforråd — minst 15–20 kg honning per kube. Mus-sperre settes på innflygningsåpningen. Siste varroa-kontroll.',
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
        heading: 'Svirming',
        body: 'Svirming er bienes naturlige formeringsmetode. Halvparten av kolonien forlater kuben med den gamle dronningen og danner et sverm. For birøkteren betyr det halvert styrke og tapt honningpotensial. Regelmessige inspeksjoner og svermforebygging (f.eks. kunstig svirming) er viktig.',
      },
      {
        heading: 'Kommunikasjon',
        body: 'Bier kommuniserer gjennom feromoner og dans. Vokseldansen forteller retning og avstand til matkilder. Alarmferomonet (fra broddapparatet) er grunnen til at én stikk kan utløse flere — hold roen og bruk røyk for å maskere det.',
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
        body: 'Gi aldri ubehandlet honning fra ukjent kilde — det kan overføre Amerikansk yngelrotte (AFB). Gi ikke melk, juice eller annen mat. Fôr alltid om kvelden for å unngå røveri. Slutt å fôre i god tid før honninginnsamlingen begynner om våren.',
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
        heading: 'Hvorfor sverver bier?',
        body: 'Svirming er bienes naturlige formeringsmåte. En koloni sverver vanligvis når: yngelrommet er fullt, det er mye bier og lite plass, eller kolonien er i god vekst på forsommeren. Alder på dronningen, genetikk og været påvirker svermtilbøyeligheten.',
      },
      {
        heading: 'Svermceller — varseltegn',
        body: 'Inspiser ukentlig i mai–juni for svermceller. De lages langs kanten og bunnen av rammen, og ligner en peanøtt. Finnes en ferdig lukket dronningcelle uten åpen nok celle — kolonien har sannsynligvis allerede svermet. Åpne celler gir deg fremdeles tid.',
      },
      {
        heading: 'Kunstig svirming',
        body: 'Enkleste forebygging: del kolonien i to. Flytt dronningen med 3–4 rammer bier og yngel til en ny kube. La svermcellene i den gamle kuben klekke ny dronning. Begge kolonier tror de har svermet og sverminstinktet avtar. Begge kan vokse seg sterke.',
      },
      {
        heading: 'Andre svermforebyggingsmetoder',
        body: 'Gi mer plass (legg på ekstra kasse) før det er fullt. Klipp svermceller — men vær konsekvent, én oversett celle og kuben sverver. Bytte dronning til ung dronning av svermfattig rase (f.eks. Buckfast). Avl på kolonier som sjelden sverver.',
      },
      {
        heading: 'Fange et sverm',
        body: 'Et sverm som henger i et tre er rolig og ufarlig — biene har ingen yngel å forsvare. Rist svermen ned i en svermkasse eller kube. Pass på at dronningen er med — da blir de fleste biene. Plasser kassen med innflygning mot kvelden. Sjekk etter 3 dager om de er blitt.',
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
    ],
  },
];
