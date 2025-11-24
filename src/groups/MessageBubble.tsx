import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  fromMe?: boolean;
};

type Props = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: Props) {
  const fromMe = Boolean(message.fromMe);

  return (
    <View style={[styles.row, fromMe ? styles.rowMe : styles.rowThem]}>
      <View style={[styles.bubble, fromMe ? styles.bubbleMe : styles.bubbleThem]}>
        {!fromMe && <Text style={styles.sender}>{message.sender}</Text>}
        <Text style={[styles.text, fromMe ? styles.textMe : styles.textThem]}>{message.text}</Text>
        <Text style={styles.meta}>{message.timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowMe: {
    alignItems: 'flex-end',
  },
  rowThem: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#0C78F2',
    borderTopRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sender: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
    fontWeight: '600',
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMe: {
    color: '#fff',
  },
  textThem: {
    color: '#111827',
  },
  meta: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'right',
  },
});
