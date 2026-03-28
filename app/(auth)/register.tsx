import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Navn må ha minst 2 tegn'),
  email: z.string().email('Ugyldig e-postadresse'),
  password: z.string().min(8, 'Passord må ha minst 8 tegn'),
});

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleRegister = async () => {
    setServerError('');
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
      setServerError('Sjekk e-posten din og bekreft kontoen, deretter logg inn.');
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

        <Button label="Opprett konto" onPress={handleRegister} loading={loading} />

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
  link: { color: Colors.honey, fontSize: 14, fontWeight: '600' },
});
