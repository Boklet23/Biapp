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
    onError: (error) => {
      Sentry.captureException(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});
