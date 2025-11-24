import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({ placeholder = 'Message group…', onSend, disabled = false }: Props) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend?.(trimmed);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={setValue}
        multiline
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 50,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#111',
  },
  sendDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
