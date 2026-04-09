import { supabase } from '@/lib/supabase';
import { MarketplaceListing } from '@/types';

function mapListing(row: Record<string, unknown>): MarketplaceListing {
  if (typeof row.id !== 'string') throw new Error('Ugyldig annonse: mangler id');
  return {
    id: row.id,
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    title: typeof row.title === 'string' ? row.title : '',
    description: typeof row.description === 'string' ? row.description : null,
    category: typeof row.category === 'string' ? row.category as MarketplaceListing['category'] : 'annet',
    price: typeof row.price === 'number' ? row.price : null,
    priceUnit: typeof row.price_unit === 'string' ? row.price_unit : 'kr',
    location: typeof row.location === 'string' ? row.location : null,
    contactInfo: typeof row.contact_info === 'string' ? row.contact_info : null,
    isActive: typeof row.is_active === 'boolean' ? row.is_active : true,
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    sellerName: typeof row.seller_name === 'string' ? row.seller_name : null,
  };
}

export async function fetchListings(category?: string): Promise<MarketplaceListing[]> {
  let query = supabase
    .from('marketplace_listings')
    .select('*, profiles(display_name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'alle') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data as Record<string, unknown>[]).map((row) => ({
    ...mapListing(row),
    sellerName: typeof (row.profiles as Record<string, unknown> | null)?.display_name === 'string'
      ? (row.profiles as Record<string, unknown>).display_name as string
      : null,
  }));
}

export async function fetchMyListings(): Promise<MarketplaceListing[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Record<string, unknown>[]).map(mapListing);
}

export interface CreateListingInput {
  title: string;
  description?: string;
  category: MarketplaceListing['category'];
  price?: number;
  location?: string;
  contactInfo?: string;
}

export async function createListing(input: CreateListingInput): Promise<MarketplaceListing> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert({
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      price: input.price ?? null,
      location: input.location ?? null,
      contact_info: input.contactInfo ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapListing(data as Record<string, unknown>);
}

export async function deactivateListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('marketplace_listings')
    .update({ is_active: false, sold_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from('marketplace_listings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
