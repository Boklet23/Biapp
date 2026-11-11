import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/services/harvest', () => ({
  createHarvest: jest.fn(),
  deleteHarvest: jest.fn(),
}));

import { createHarvest, deleteHarvest } from '@/services/harvest';
import { useCreateHarvest, useDeleteHarvest, HARVESTS_KEY } from '@/hooks/useHarvestMutations';
import type { HarvestRecord } from '@/types';

const mockCreate = createHarvest as jest.MockedFunction<typeof createHarvest>;
const mockDelete = deleteHarvest as jest.MockedFunction<typeof deleteHarvest>;

const sampleRecord: HarvestRecord = {
  id: 'h1',
  hiveId: 'hive1',
  userId: 'u1',
  harvestedAt: '2026-08-01',
  quantityKg: 12.5,
  notes: null,
  createdAt: '2026-08-01T10:00:00Z',
};

const sampleInput = { hiveId: 'hive1', harvestedAt: '2026-08-01', quantityKg: 12.5 };

/** Minimal renderHook uten @testing-library (kun react-test-renderer, ingen JSX). */
function renderHook<T>(useHook: () => T, client: QueryClient) {
  const result: { current: T } = { current: undefined as unknown as T };
  function Probe() {
    result.current = useHook();
    return null;
  }
  let root: ReactTestRenderer | undefined;
  act(() => {
    root = create(
      React.createElement(QueryClientProvider, { client }, React.createElement(Probe)),
    );
  });
  return { result, unmount: () => act(() => root?.unmount()) };
}

function makeClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = jest.spyOn(client, 'invalidateQueries');
  return { client, invalidateSpy };
}

afterEach(() => jest.clearAllMocks());

describe('useCreateHarvest', () => {
  it('invaliderer delt høst-cache FØR kallerens onSuccess kjøres', async () => {
    const { client, invalidateSpy } = makeClient();
    mockCreate.mockResolvedValueOnce(sampleRecord);
    const onSuccess = jest.fn();

    const { result, unmount } = renderHook(() => useCreateHarvest({ onSuccess }), client);
    await act(async () => {
      await result.current.mutateAsync(sampleInput);
    });

    // v5 sender MutationFunctionContext som 2. argument — assert kun input.
    expect(mockCreate.mock.calls[0][0]).toEqual(sampleInput);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: HARVESTS_KEY });
    // Regresjonsvakt for spread-rekkefølgen: bytter noen {...options} til å
    // komme ETTER onSuccess, overstyrer kallerens callback wrapperen — da
    // fyrer onSuccess fortsatt (grønt UI), men invalidering uteblir stille.
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess.mock.calls[0][0]).toEqual(sampleRecord);
    const invalidateOrder = invalidateSpy.mock.invocationCallOrder[0];
    const callbackOrder = onSuccess.mock.invocationCallOrder[0];
    expect(invalidateOrder).toBeLessThan(callbackOrder);
    unmount();
  });

  it('kaller onError med feilen og invaliderer IKKE ved feil', async () => {
    const { client, invalidateSpy } = makeClient();
    const failure = new Error('RLS sa nei');
    mockCreate.mockRejectedValueOnce(failure);
    const onError = jest.fn();

    const { result, unmount } = renderHook(() => useCreateHarvest({ onError }), client);
    await act(async () => {
      await result.current.mutateAsync(sampleInput).catch(() => {});
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(failure);
    expect(invalidateSpy).not.toHaveBeenCalled();
    unmount();
  });
});

describe('useDeleteHarvest', () => {
  it('invaliderer delt høst-cache og kjører kallerens onSuccess', async () => {
    const { client, invalidateSpy } = makeClient();
    mockDelete.mockResolvedValueOnce(undefined);
    const onSuccess = jest.fn();

    const { result, unmount } = renderHook(() => useDeleteHarvest({ onSuccess }), client);
    await act(async () => {
      await result.current.mutateAsync('h1');
    });

    expect(mockDelete.mock.calls[0][0]).toBe('h1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: HARVESTS_KEY });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('propagerer feil til kallerens onError uten invalidering', async () => {
    const { client, invalidateSpy } = makeClient();
    mockDelete.mockRejectedValueOnce(new Error('nettverk'));
    const onError = jest.fn();

    const { result, unmount } = renderHook(() => useDeleteHarvest({ onError }), client);
    await act(async () => {
      await result.current.mutateAsync('h1').catch(() => {});
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).not.toHaveBeenCalled();
    unmount();
  });
});
