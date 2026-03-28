import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ArticleCard } from '@/components/info/ArticleCard';
import { DiseaseCard } from '@/components/disease/DiseaseCard';
import { Colors } from '@/constants/colors';
import { GUIDE_ARTICLES } from '@/constants/beginnerGuide';
import { DISEASES } from '@/constants/diseases';

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function Info() {
  const [query, setQuery] = useState('');

  const filteredDiseases = useMemo(() => {
    if (!query.trim()) return DISEASES;
    const q = query.toLowerCase();
    return DISEASES.filter(
      (d) =>
        d.nameNo.toLowerCase().includes(q) ||
        d.symptoms.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Info</Text>

        {/* Nybegynnerguide */}
        <SectionTitle>Nybegynnerguide</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.articleScroll}
        >
          {GUIDE_ARTICLES.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              onPress={() =>
                router.push({
                  pathname: '/laer/guide/[slug]',
                  params: { slug: article.slug },
                } as any)
              }
            />
          ))}
        </ScrollView>

        {/* Sykdomsguide */}
        <SectionTitle>Sykdomsguide</SectionTitle>
        <Text style={styles.sub}>10 vanlige tilstander i norsk birøkt</Text>

        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Søk på sykdom eller symptom..."
          placeholderTextColor={Colors.mid + '80'}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />

        {filteredDiseases.length === 0 ? (
          <Text style={styles.empty}>Ingen treff for «{query}»</Text>
        ) : (
          filteredDiseases.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onPress={() =>
                router.push({
                  pathname: '/laer/[slug]',
                  params: { slug: disease.slug },
                } as any)
              }
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 12, gap: 12, paddingBottom: 32 },
  header: { fontSize: 28, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
  },
  articleScroll: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 4,
  },
  sub: { fontSize: 13, color: Colors.mid, marginTop: -6, marginBottom: 4 },
  search: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.mid + '20',
  },
  empty: { fontSize: 14, color: Colors.mid, textAlign: 'center', marginTop: 12 },
});
