-- Opprydding etter 0046:
--  - count_active_hives_for_user (fra 0020) ble foreldreløs da 0039 droppet
--    UPDATE-policyen som brukte den. Den er SECURITY DEFINER, tar vilkårlig
--    p_user_id og lekker en annen brukers aktive kubetelling via RPC. Slettes.
--  - enforce_starter_hive_limit er en trigger-funksjon og skal aldri kalles
--    direkte via /rest/v1/rpc. Trigger-funksjoner fyrer uavhengig av EXECUTE-grant.
DROP FUNCTION IF EXISTS count_active_hives_for_user(uuid);

REVOKE EXECUTE ON FUNCTION enforce_starter_hive_limit() FROM public, anon, authenticated;
