import * as Sentry from '@sentry/react-native';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/toast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      Sentry.captureException(error);
      useToastStore.getState().show(error.message, 'error');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      Sentry.captureException(error);
      // Only surface a toast when the mutation has no local onError handler,
      // so mutations that already show their own toast/alert don't double-fire.
      if (!mutation.options.onError) {
        useToastStore.getState().show(error.message, 'error');
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});
