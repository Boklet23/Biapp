import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/services/googleAuth';

const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(6, 'Passord må ha minst 6 tegn'),
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleLogin = async () => {
    setServerError('');
    const result = loginSchema.safeParse({ email, password });

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

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    setLoading(false);

    if (error) {
      setServerError('Feil e-post eller passord. Prøv igjen.');
    }
  };

  const handleForgotPassword = async () => {
    setServerError('');
    setInfoMessage('');
    const emailCheck = z.string().email().safeParse(email.trim());
    if (!emailCheck.success) {
      setErrors({ email: 'Skriv inn e-postadressen din først' });
      return;
    }
    setErrors({});
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.data);
    setResetting(false);
    // Avslør ikke om e-posten finnes (kontoenumerering) — samme melding uansett
    if (error) {
      setServerError('Kunne ikke sende e-post akkurat nå. Prøv igjen om litt.');
    } else {
      setInfoMessage('Hvis adressen er registrert, har vi sendt en lenke for å tilbakestille passordet. Sjekk innboksen din.');
    }
  };

  const handleGoogleLogin = async () => {
    setServerError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setServerError('Google-innlogging feilet. Prøv igjen.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Logg inn</Text>

        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
        {infoMessage ? <Text style={styles.infoMessage}>{infoMessage}</Text> : null}

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
          autoComplete="password"
          error={errors.password}
        />

        <Pressable
          onPress={handleForgotPassword}
          disabled={resetting}
          style={styles.forgotWrap}
          accessibilityRole="button"
          accessibilityLabel="Tilbakestill passordet ditt"
        >
          <Text style={styles.forgotText}>
            {resetting ? 'Sender …' : 'Glemt passord?'}
          </Text>
        </Pressable>

        <Button label="Logg inn" onPress={handleLogin} loading={loading} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>eller</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.8 }]}
          onPress={handleGoogleLogin}
          disabled={googleLoading || loading}
          accessibilityLabel="Logg inn med Google"
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
          <Text style={styles.footerText}>Har du ikke konto? </Text>
          <Text
            style={styles.link}
            onPress={() => router.replace('/(auth)/register')}
            accessibilityRole="link"
          >
            Registrer deg
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
  infoMessage: {
    backgroundColor: Colors.successSoft,
    color: Colors.dark,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  forgotWrap: { alignSelf: 'flex-end', marginTop: -4, marginBottom: 12, padding: 4 },
  forgotText: { color: Colors.honeyDark, fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.mid, fontSize: 14 },
  link: { color: Colors.honeyDark, fontSize: 14, fontWeight: '600' },

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
