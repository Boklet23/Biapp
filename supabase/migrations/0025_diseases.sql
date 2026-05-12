-- Diseases table: replaces constants/diseases.ts — updatable without app release
CREATE TABLE public.diseases (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               text NOT NULL UNIQUE,
  name_no            text NOT NULL,
  is_notifiable      boolean NOT NULL DEFAULT false,
  severity           text NOT NULL CHECK (severity IN ('lav', 'moderat', 'alvorlig', 'kritisk')),
  description        text NOT NULL,
  symptoms           text NOT NULL,
  treatment          text NOT NULL,
  prevention         text NOT NULL,
  seasonal_treatment jsonb,           -- [{season: 'Vår', tips: ['...']}]
  diagnostic_tips    text,
  goal               text,
  sources            text,
  image_url          text,            -- Main image (AI-generated or curated)
  image_prompt       text,            -- DALL-E 3 prompt for generating the image
  photos             jsonb NOT NULL DEFAULT '[]', -- [{uri?, emoji?, caption, bg}]
  sort_order         int NOT NULL DEFAULT 0,
  is_active          boolean NOT NULL DEFAULT true,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.diseases (slug);
CREATE INDEX ON public.diseases (sort_order);

ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diseases: alle kan lese"
  ON public.diseases FOR SELECT
  USING (is_active = true);
