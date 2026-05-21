ALTER TABLE public.bee_associations
  ADD COLUMN contact_person text,
  ADD COLUMN facebook_url   text,
  ADD COLUMN parent_id      uuid REFERENCES public.bee_associations(id);

CREATE INDEX bee_associations_parent_idx ON public.bee_associations(parent_id);
