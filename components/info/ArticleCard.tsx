import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { GuideArticle } from '@/constants/beginnerGuide';

interface ArticleCardProps {
  article: GuideArticle;
  onPress: () => void;
}

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={article.title}
    >
      <Text style={styles.emoji}>{article.emoji}</Text>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      <Text style={styles.intro} numberOfLines={2}>{article.intro}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  emoji: { fontSize: 32 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.dark, lineHeight: 18 },
  intro: { fontSize: 11, color: Colors.mid, lineHeight: 15 },
});
