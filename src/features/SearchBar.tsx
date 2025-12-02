import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from '../components/Icon';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputShell}>
        <Icon name="magnify" size={18} color="#7b8087" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Search'}
          placeholderTextColor="#8c9299"
          style={styles.input}
        />
      </View>
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
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe3e7',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: '#222',
    fontSize: 15,
  },
});
