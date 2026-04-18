import { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Colors } from '@/constants/colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>🐝</Text>
          <Text style={styles.title}>Noe gikk galt</Text>
          <Text style={styles.body}>
            Et uventet problem oppstod. Feilen er rapportert og vi jobber med det.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.btnText}>Last inn på nytt</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  icon: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.dark, textAlign: 'center' },
  body: { fontSize: 15, color: Colors.mid, textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.honey,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
