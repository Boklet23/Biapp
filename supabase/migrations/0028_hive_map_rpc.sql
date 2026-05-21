CREATE OR REPLACE FUNCTION public.get_map_hives()
RETURNS TABLE (
  id             uuid,
  name           text,
  type           text,
  location_lat   double precision,
  location_lng   double precision,
  location_name  text,
  owner_id       uuid,
  owner_name     text,
  relationship   text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_team_id uuid;
BEGIN
  SELECT tm.team_id INTO current_team_id
  FROM team_members tm
  WHERE tm.user_id = current_user_id
  LIMIT 1;

  RETURN QUERY
  -- Egne kuber
  SELECT h.id, h.name, h.type::text,
         h.location_lat, h.location_lng, h.location_name,
         h.user_id, COALESCE(p.display_name, 'Birøkter'::text), 'own'::text
  FROM hives h
  LEFT JOIN profiles p ON p.id = h.user_id
  WHERE h.user_id = current_user_id
    AND h.is_active = true AND h.location_lat IS NOT NULL

  UNION ALL

  -- Lag-kuber (teams/team_members)
  SELECT h.id, h.name, h.type::text,
         h.location_lat, h.location_lng, h.location_name,
         h.user_id, COALESCE(p.display_name, 'Birøkter'::text), 'team'::text
  FROM hives h
  LEFT JOIN profiles p ON p.id = h.user_id
  JOIN team_members tm ON tm.user_id = h.user_id
  WHERE tm.team_id = current_team_id
    AND current_team_id IS NOT NULL
    AND h.user_id != current_user_id
    AND h.is_active = true AND h.location_lat IS NOT NULL

  UNION ALL

  -- Delte kuber (hive_collaborators)
  SELECT h.id, h.name, h.type::text,
         h.location_lat, h.location_lng, h.location_name,
         h.user_id, COALESCE(p.display_name, 'Birøkter'::text), 'shared'::text
  FROM hives h
  LEFT JOIN profiles p ON p.id = h.user_id
  JOIN hive_collaborators hc ON hc.hive_id = h.id
  WHERE hc.collaborator_id = current_user_id
    AND h.user_id != current_user_id
    AND h.is_active = true AND h.location_lat IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_map_hives() TO authenticated;
