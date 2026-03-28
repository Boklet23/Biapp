export interface BeeAssociation {
  id: string;
  name: string;
  county: string;
  website: string | null;
  email: string | null;
}

export const BEE_ASSOCIATIONS: BeeAssociation[] = [
  { id: '1', name: 'Akershus Birøkterlag', county: 'Akershus', website: 'https://akershusbilag.no', email: 'post@akershusbilag.no' },
  { id: '2', name: 'Aust-Agder Birøkterlag', county: 'Agder', website: null, email: 'austagderbilag@gmail.com' },
  { id: '3', name: 'Buskerud Birøkterlag', county: 'Viken', website: 'https://buskerudbirøkterlag.no', email: null },
  { id: '4', name: 'Finnmark Birøkterlag', county: 'Finnmark', website: null, email: 'finnmarkbilag@gmail.com' },
  { id: '5', name: 'Hedmark Birøkterlag', county: 'Innlandet', website: null, email: 'hedmarkbilag@gmail.com' },
  { id: '6', name: 'Hordaland Birøkterlag', county: 'Vestland', website: 'https://hordalandbilag.no', email: 'post@hordalandbilag.no' },
  { id: '7', name: 'Møre og Romsdal Birøkterlag', county: 'Møre og Romsdal', website: null, email: 'morebilag@gmail.com' },
  { id: '8', name: 'Nordland Birøkterlag', county: 'Nordland', website: null, email: 'nordlandbilag@gmail.com' },
  { id: '9', name: 'Nord-Trøndelag Birøkterlag', county: 'Trøndelag', website: null, email: 'ntbilag@gmail.com' },
  { id: '10', name: 'Oppland Birøkterlag', county: 'Innlandet', website: null, email: 'opplandbilag@gmail.com' },
  { id: '11', name: 'Oslo og Omegn Birøkterlag', county: 'Oslo', website: 'https://oslobirøkterlag.no', email: 'post@oslobirøkterlag.no' },
  { id: '12', name: 'Rogaland Birøkterlag', county: 'Rogaland', website: 'https://rogalandbilag.no', email: 'post@rogalandbilag.no' },
  { id: '13', name: 'Sogn og Fjordane Birøkterlag', county: 'Vestland', website: null, email: 'sfbilag@gmail.com' },
  { id: '14', name: 'Sør-Trøndelag Birøkterlag', county: 'Trøndelag', website: 'https://strbilag.no', email: 'post@strbilag.no' },
  { id: '15', name: 'Telemark Birøkterlag', county: 'Telemark', website: null, email: 'telemarkbilag@gmail.com' },
  { id: '16', name: 'Troms Birøkterlag', county: 'Troms', website: null, email: 'tromsbilag@gmail.com' },
  { id: '17', name: 'Vest-Agder Birøkterlag', county: 'Agder', website: null, email: 'vasbilag@gmail.com' },
  { id: '18', name: 'Vestfold Birøkterlag', county: 'Vestfold', website: null, email: 'vestfoldbilag@gmail.com' },
  { id: '19', name: 'Østfold Birøkterlag', county: 'Viken', website: 'https://ostfoldbilag.no', email: 'post@ostfoldbilag.no' },
  { id: '20', name: 'Norges Birøkterlag (NBF)', county: 'Nasjonalt', website: 'https://nbf.no', email: 'post@nbf.no' },
];
