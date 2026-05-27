import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/services/googleAuth';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Navn må ha minst 2 tegn'),
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(8, 'Passord må ha minst 8 tegn'),
});

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleRegister = async () => {
    setServerError('');
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    const result = registerSchema.safeParse({ displayName, email, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { display_name: result.data.displayName },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('Denne e-postadressen er allerede registrert.');
      } else {
        setServerError(error.message);
      }
      return;
    }

    if (data.session) {
      router.replace('/(app)/(tabs)/hjem');
    } else {
      setPendingVerification(true);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setServerError('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
    } catch {
      setServerError('Kunne ikke sende e-post på nytt. Prøv igjen.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Opprett konto</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
        {pendingVerification && (
          <View style={styles.verificationBox}>
            <Text style={styles.verificationText}>
              Sjekk e-posten din og bekreft kontoen, deretter logg inn.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.resendBtn, pressed && { opacity: 0.8 }]}
              onPress={handleResend}
              disabled={resendLoading}
              accessibilityLabel="Send bekreftelsesepost på nytt"
            >
              {resendLoading
                ? <ActivityIndicator size="small" color={Colors.honey} />
                : <Text style={styles.resendBtnText}>Send bekreftelsesepost på nytt</Text>
              }
            </Pressable>
          </View>
        )}

        <Input
          label="Navn"
          value={displayName}
          onChangeText={setDisplayName}
          autoComplete="name"
          error={errors.displayName}
        />
        <Input
          label="E-post"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <Input
          label="Passord"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
        />

        <Pressable style={styles.consentRow} onPress={() => { setTermsAccepted(!termsAccepted); setTermsError(false); }}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.consentText}>
            Jeg godtar{' '}
            <Text style={styles.consentLink} onPress={() => Linking.openURL('https://boklet23.github.io/biapp/terms')}>
              vilkår for bruk
            </Text>
            {' '}og{' '}
            <Text style={styles.consentLink} onPress={() => Linking.openURL('https://boklet23.github.io/biapp/privacy')}>
              personvernerklæringen
            </Text>
          </Text>
        </Pressable>
        {termsError && <Text style={styles.termsError}>Du må godta vilkårene for å opprette konto.</Text>}

        <Button label="Opprett konto" onPress={handleRegister} loading={loading} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>eller</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.8 }]}
          onPress={async () => {
            setServerError('');
            setGoogleLoading(true);
            try {
              await signInWithGoogle();
            } catch {
              setServerError('Google-innlogging feilet. Prøv igjen.');
            } finally {
              setGoogleLoading(false);
            }
          }}
          disabled={googleLoading || loading}
          accessibilityLabel="Registrer med Google"
        >
          {googleLoading ? (
            <ActivityIndicator color={Colors.dark} size="small" />
          ) : (
            <>
              <Text style={styles.googleBtnIcon}>G</Text>
              <Text style={styles.googleBtnText}>Fortsett med Google</Text>
            </>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Har du allerede konto? </Text>
          <Text
            style={styles.link}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="link"
          >
            Logg inn
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  serverError: {
    backgroundColor: '#FADBD8',
    color: Colors.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.mid, fontSize: 14 },
  link: { color: Colors.honeyDark, fontSize: 14, fontWeight: '600' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.mid + '60',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.honey, borderColor: Colors.honey },
  checkmark: { fontSize: 13, fontWeight: '700', color: Colors.white },
  consentText: { flex: 1, fontSize: 13, color: Colors.mid, lineHeight: 20 },
  consentLink: { color: Colors.honeyDark, fontWeight: '600' },
  termsError: { fontSize: 13, color: Colors.error, marginTop: -8 },
  verificationBox: { backgroundColor: '#EBF5FB', borderRadius: 10, padding: 16, marginBottom: 16, gap: 12 },
  verificationText: { fontSize: 14, color: Colors.dark, lineHeight: 20 },
  resendBtn: { alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.honeyDark },
  resendBtnText: { color: Colors.honeyDark, fontSize: 14, fontWeight: '600' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.mid + '25' },
  dividerText: { fontSize: 13, color: Colors.mid },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: Colors.mid + '30',
    minHeight: 48,
  },
  googleBtnIcon: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: Colors.dark },
});
