import { supabase } from '@/lib/supabase';
import { Disease, DiseasePhoto, SeasonalTip } from '@/types';

export async function fetchDiseases(): Promise<Disease[]> {
  const { data, error } = await supabase
    .from('diseases')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data.map(mapDisease);
}

export async function fetchDiseaseBySlug(slug: string): Promise<Disease | null> {
  const { data, error } = await supabase
    .from('diseases')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapDisease(data);
}

function mapDisease(row: Record<string, unknown>): Disease {
  // Samme guard-mønster som øvrige mapX(): kast på manglende nøkkelfelt,
  // render-trygge tomstrenger for tekstfelt (laer har DISEASES-fallback).
  if (typeof row.id !== 'string') throw new Error('Ugyldig sykdom: mangler id');
  if (typeof row.slug !== 'string') throw new Error('Ugyldig sykdom: mangler slug');
  if (typeof row.name_no !== 'string') throw new Error('Ugyldig sykdom: mangler name_no');
  return {
    id: row.id,
    slug: row.slug,
    nameNo: row.name_no,
    isNotifiable: row.is_notifiable === true,
    severity: row.severity as Disease['severity'],
    description: typeof row.description === 'string' ? row.description : '',
    symptoms: typeof row.symptoms === 'string' ? row.symptoms : '',
    treatment: typeof row.treatment === 'string' ? row.treatment : '',
    prevention: typeof row.prevention === 'string' ? row.prevention : '',
    thumbnailPath: typeof row.image_url === 'string' ? row.image_url : null,
    photos: Array.isArray(row.photos) ? (row.photos as DiseasePhoto[]) : [],
    seasonalTreatment: Array.isArray(row.seasonal_treatment)
      ? (row.seasonal_treatment as SeasonalTip[])
      : null,
    diagnosticTips: typeof row.diagnostic_tips === 'string' ? row.diagnostic_tips : null,
    goal: typeof row.goal === 'string' ? row.goal : null,
    sources: typeof row.sources === 'string' ? row.sources : null,
    imageUrl: typeof row.image_url === 'string' ? row.image_url : null,
    imagePrompt: typeof row.image_prompt === 'string' ? row.image_prompt : null,
  };
}
