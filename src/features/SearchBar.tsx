import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Search events & restaurants'}
        placeholderTextColor="#9AA0A6"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: '#f1f3f5',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
  },
});
