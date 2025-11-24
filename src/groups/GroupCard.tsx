import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  id: string;
  name: string;
  code: string;
  active?: boolean;
  onPress?: () => void;
};

export default function GroupCard({ name, code, active = false, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, active && styles.cardActive]} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.codeLabel}>Code: {code}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardActive: {
    backgroundColor: '#dcdcdc',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
});
