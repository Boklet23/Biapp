export interface EquipmentVendor {
  id: string;
  name: string;
  description: string;
  website: string;
}

export const BEE_EQUIPMENT_VENDORS: EquipmentVendor[] = [
  {
    id: 'apinor',
    name: 'Apinor',
    description: 'Utstyr for birøktere i hele landet',
    website: 'https://apinor.no',
  },
  {
    id: 'kube',
    name: 'Kube Birøkt AS',
    description: 'Kuber, utstyr og rekvisita',
    website: 'https://www.kube.no',
  },
  {
    id: 'honningcentralen',
    name: 'Honningcentralen',
    description: 'Birøkterutstyr — eid av birøktere',
    website: 'https://nettbutikk.honning.no',
  },
  {
    id: 'ktd',
    name: 'KTD',
    description: 'Stort utvalg til fordelaktige priser (Kristiansand)',
    website: 'https://www.ktd.no',
  },
  {
    id: 'hasseltun',
    name: 'Hasseltun Honning',
    description: 'Bikuber, dronningavl og varroa-utstyr',
    website: 'https://hasseltun.com',
  },
  {
    id: 'bole',
    name: 'Bole',
    description: 'Alt for komplett birøkt — kuber og arbeidsklær',
    website: 'https://www.bole.no/dyrehold/birokterutstyr',
  },
  {
    id: 'norbi',
    name: 'Norges Birøkterlag — Butikk',
    description: 'Offisiell nettbutikk for Norges Birøkterlag',
    website: 'https://norbi.no/nettbutikk',
  },
  {
    id: 'finbi',
    name: 'Finbi',
    description: 'Nybegynnerpakker og startutstyr',
    website: 'https://finbi.no',
  },
];
