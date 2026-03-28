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
];
