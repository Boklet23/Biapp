import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

// Required for Android Chrome Custom Tabs to complete properly
WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) throw error ?? new Error('Ingen OAuth-URL generert');

  // Warm up browser on Android for faster open
  await WebBrowser.warmUpAsync().catch(() => {});

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  await WebBrowser.coolDownAsync().catch(() => {});

  if (result.type !== 'success') return;

  // Extract PKCE code from redirect URL — supabase-js v2 uses PKCE by default
  const code = extractQueryParam(result.url, 'code');
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return;
  }

  // Fallback: implicit flow — extract tokens from URL fragment
  const accessToken = extractQueryParam(result.url, 'access_token');
  const refreshToken = extractQueryParam(result.url, 'refresh_token');
  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
  }
}

function extractQueryParam(url: string, param: string): string | null {
  // Handles both query strings (?code=) and hash fragments (#code=)
  const regex = new RegExp(`[?&#]${param}=([^&#]+)`);
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}
