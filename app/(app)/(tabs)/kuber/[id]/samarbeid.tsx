import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { Colors } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { addCollaboratorByEmail, fetchCollaborators, removeCollaborator, Collaborator } from '@/services/collaboration';
import { useAuthStore } from '@/store/auth';
import { useToastStore } from '@/store/toast';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';

export default function SamarbeidScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const profile = useAuthStore((s) => s.profile);
  const effectiveTier = useEffectiveTier();
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [email, setEmail] = useState('');

  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['collaborators', id],
    queryFn: () => fetchCollaborators(id),
  });

  const inviteMutation = useMutation({
    mutationFn: () => addCollaboratorByEmail(id, email.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', id] });
      setEmail('');
      showToast('Samarbeidspartner lagt til', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const removeMutation = useMutation({
    mutationFn: removeCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', id] });
      showToast('Samarbeidspartner fjernet', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const handleRemove = (collab: Collaborator) => {
    Alert.alert(
      'Fjern samarbeidspartner',
      `Er du sikker på at du vil fjerne ${collab.collaboratorName ?? collab.collaboratorEmail}?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Fjern', style: 'destructive', onPress: () => removeMutation.mutate(collab.id) },
      ]
    );
  };

  if (effectiveTier !== 'lag') {
    return (
      <Screen>
        <View style={styles.locked}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockTitle}>Lag-abonnement kreves</Text>
          <Text style={styles.lockBody}>
            Samarbeid med andre birøktere om dine kuber krever Lag-abonnement.
          </Text>
          <Button
            label="Se abonnementer"
            onPress={() => setUpgradeModalVisible(true)}
          />
        </View>
        <UpgradeModal visible={upgradeModalVisible} onClose={() => setUpgradeModalVisible(false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Samarbeidspartnere</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{collaborators.length} / 50</Text>
          </View>
        </View>

        {/* Invite section */}
        <View style={styles.inviteRow}>
          <TextInput
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            placeholder="E-post til samarbeidspartner"
            placeholderTextColor={Colors.mid + '80'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={({ pressed }) => [styles.inviteBtn, pressed && { opacity: 0.75 }]}
            onPress={() => inviteMutation.mutate()}
            disabled={inviteMutation.isPending || !email.trim()}
          >
            <Text style={styles.inviteBtnText}>
              {inviteMutation.isPending ? '...' : 'Inviter'}
            </Text>
          </Pressable>
        </View>

        {/* Collaborator list */}
        <FlatList
          data={collaborators}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.collabRow}>
              <View style={styles.collabInfo}>
                <Text style={styles.collabName}>
                  {item.collaboratorName ?? item.collaboratorEmail}
                </Text>
                {item.collaboratorName ? (
                  <Text style={styles.collabEmail}>{item.collaboratorEmail}</Text>
                ) : null}
              </View>
              {item.collaboratorId !== profile?.id && (
                <Pressable
                  onPress={() => handleRemove(item)}
                  hitSlop={10}
                  style={({ pressed }) => pressed && { opacity: 0.6 }}
                >
                  <Text style={styles.removeBtn}>Fjern</Text>
                </Pressable>
              )}
            </View>
          )}
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>Ingen samarbeidspartnere ennå. Inviter noen!</Text>
              </View>
            )
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', fontFamily: FontFamily.extrabold, color: Colors.dark },
  countBadge: {
    backgroundColor: Colors.honey + '20',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.honey },

  inviteRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  emailInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mid + '25',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.dark,
    fontFamily: FontFamily.regular,
  },
  inviteBtn: {
    backgroundColor: Colors.honey,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inviteBtnText: { fontSize: 14, fontWeight: '700', color: Colors.dark, fontFamily: FontFamily.bold },

  list: { gap: 1 },
  collabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mid + '18',
  },
  collabInfo: { gap: 2 },
  collabName: { fontSize: 15, fontWeight: '500', fontFamily: FontFamily.medium, color: Colors.dark },
  collabEmail: { fontSize: 12, fontFamily: FontFamily.regular, color: Colors.mid },
  removeBtn: { fontSize: 14, fontWeight: '600', color: Colors.error },

  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, fontFamily: FontFamily.regular, color: Colors.mid, textAlign: 'center' },

  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  lockIcon: { fontSize: 48 },
  lockTitle: { fontSize: 20, fontWeight: '700', fontFamily: FontFamily.bold, color: Colors.dark, textAlign: 'center' },
  lockBody: { fontSize: 14, fontFamily: FontFamily.regular, color: Colors.mid, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
