import { supabase } from '@/lib/supabase';

export interface BeeAssociation {
  id: string;
  name: string;
  county: string;
  type: 'nasjonal' | 'fylke' | 'lokal';
  website: string | null;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  facebookUrl: string | null;
  parentId: string | null;
  updatedAt: string;
}

export interface FylkeslagGroup {
  fylkeslag: BeeAssociation;
  lokallag: BeeAssociation[];
}

export interface EquipmentVendor {
  id: string;
  name: string;
  description: string | null;
  website: string;
  phone: string | null;
  sortOrder: number;
  updatedAt: string;
}

const TYPE_ORDER: Record<string, number> = { nasjonal: 0, fylke: 1, lokal: 2 };

export async function fetchBeeAssociations(): Promise<BeeAssociation[]> {
  const { data, error } = await supabase
    .from('bee_associations')
    .select('*')
    .eq('is_active', true)
    .order('county')
    .order('name');
  if (error) throw error;
  const mapped = data.map(mapAssociation);
  mapped.sort((a, b) => {
    const typeDiff = (TYPE_ORDER[a.type] ?? 2) - (TYPE_ORDER[b.type] ?? 2);
    if (typeDiff !== 0) return typeDiff;
    const countyDiff = a.county.localeCompare(b.county, 'no');
    if (countyDiff !== 0) return countyDiff;
    return a.name.localeCompare(b.name, 'no');
  });
  return mapped;
}

export async function fetchEquipmentVendors(): Promise<EquipmentVendor[]> {
  const { data, error } = await supabase
    .from('equipment_vendors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .order('name');
  if (error) throw error;
  return data.map(mapVendor);
}

function mapAssociation(row: Record<string, unknown>): BeeAssociation {
  const type = row.type as string;
  return {
    id: row.id as string,
    name: row.name as string,
    county: row.county as string,
    type: type === 'nasjonal' || type === 'fylke' ? type : 'lokal',
    website: typeof row.website === 'string' ? row.website : null,
    email: typeof row.email === 'string' ? row.email : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
    contactPerson: typeof row.contact_person === 'string' ? row.contact_person : null,
    facebookUrl: typeof row.facebook_url === 'string' ? row.facebook_url : null,
    parentId: typeof row.parent_id === 'string' ? row.parent_id : null,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchGroupedAssociations(): Promise<{
  nasjonal: BeeAssociation[];
  groups: FylkeslagGroup[];
  ungrouped: BeeAssociation[];
}> {
  const all = await fetchBeeAssociations();
  const nasjonal = all.filter((a) => a.type === 'nasjonal');
  const fylkeslag = all.filter((a) => a.type === 'fylke');
  const lokallag = all.filter((a) => a.type === 'lokal');

  const groups = fylkeslag.map((f) => ({
    fylkeslag: f,
    lokallag: lokallag.filter((l) => l.parentId === f.id),
  }));
  const ungrouped = lokallag.filter((l) => !l.parentId);
  return { nasjonal, groups, ungrouped };
}

function mapVendor(row: Record<string, unknown>): EquipmentVendor {
  return {
    id: row.id as string,
    name: row.name as string,
    description: typeof row.description === 'string' ? row.description : null,
    website: row.website as string,
    phone: typeof row.phone === 'string' ? row.phone : null,
    sortOrder: typeof row.sort_order === 'number' ? row.sort_order : 0,
    updatedAt: row.updated_at as string,
  };
}
