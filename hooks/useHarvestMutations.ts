import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createHarvest, deleteHarvest, type CreateHarvestData } from '@/services/harvest';
import { HarvestRecord } from '@/types';

/** Delt cache-nøkkel for høstinger — brukes av hjem, info, sesongsammenligning og kubeprofil. */
export const HARVESTS_KEY = ['harvests'] as const;

/** Oppretter en høsting og invaliderer den delte høst-cachen. Ev. onSuccess/onError fra kalleren kjøres etterpå. */
export function useCreateHarvest(
  options?: UseMutationOptions<HarvestRecord, Error, CreateHarvestData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createHarvest,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}

/** Sletter en høsting (by id) og invaliderer den delte høst-cachen. */
export function useDeleteHarvest(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: deleteHarvest,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: HARVESTS_KEY });
      options?.onSuccess?.(...args);
    },
  });
}
