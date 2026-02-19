import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface Props {
  entregue: boolean;
  isImportacao: boolean;
}

export function StatusBadge({ entregue, isImportacao }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, entregue ? styles.badgeSucesso : styles.badgePendente]}>
        <Ionicons
          name={entregue ? 'checkmark-circle' : 'time-outline'}
          size={14}
          color={entregue ? colors.sucesso : colors.laranja}
        />
        <Text style={[styles.texto, { color: entregue ? colors.sucesso : colors.laranja }]}>
          {entregue ? 'Entregue' : 'Em trânsito'}
        </Text>
      </View>

      {isImportacao && (
        <View style={styles.badgeImportacao}>
          <Ionicons name="globe-outline" size={14} color={colors.roxo} />
          <Text style={[styles.texto, { color: colors.roxo }]}>Importação</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSucesso: {
    backgroundColor: '#E8F5E9',
  },
  badgePendente: {
    backgroundColor: '#FFF3E0',
  },
  badgeImportacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
});
