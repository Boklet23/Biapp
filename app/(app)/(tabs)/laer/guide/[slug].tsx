import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/colors';
import { GUIDE_ARTICLES } from '@/constants/beginnerGuide';

export default function GuideDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = GUIDE_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Screen>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Artikkel ikke funnet</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>{article.emoji}</Text>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.intro}>{article.intro}</Text>

        <View style={styles.divider} />

        {article.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 16, paddingBottom: 40 },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  intro: { fontSize: 16, color: Colors.mid, lineHeight: 24, marginBottom: 4 },
  divider: {
    height: 1,
    backgroundColor: Colors.mid + '20',
    marginVertical: 20,
  },
  section: { marginBottom: 24 },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 24,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 15, color: Colors.mid },
});
