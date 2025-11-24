import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatInput from '../groups/ChatInput';
import GroupCard from '../groups/GroupCard';
import MessageBubble, { ChatMessage } from '../groups/MessageBubble';

type Group = {
  id: string;
  name: string;
  code: string;
};

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};

export default function ChatScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  const handleCreateGroup = useCallback(() => {
    const stamp = Date.now();
    const randomCode = Math.random().toString(36).slice(2, 7).toUpperCase();
    setGroups((prev) => [
      {
        id: `g-${stamp}`,
        name: `Group ${randomCode}`,
        code: randomCode,
      },
      ...prev,
    ]);
  }, []);

  const handleJoinGroup = useCallback(() => {
    const trimmed = joinCode.trim().toUpperCase();
    if (!trimmed) return;
    const exists = groups.some((g) => g.code.toUpperCase() === trimmed);
    if (!exists) {
      setGroups((prev) => [
        {
          id: `join-${Date.now()}`,
          name: `Group ${trimmed}`,
          code: trimmed,
        },
        ...prev,
      ]);
    }
    setJoinCode('');
  }, [joinCode, groups]);

  const handleSelectGroup = useCallback((group: Group) => {
    setActiveGroup(group);
  }, []);

  const confirmLeaveGroup = useCallback((group: Group) => {
    Alert.alert('Leave Group', `Leave ${group.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          setGroups((prev) => prev.filter((g) => g.id !== group.id));
          setMessagesByGroup((prev) => {
            const next = { ...prev };
            delete next[group.id];
            return next;
          });
          setActiveGroup((current) => (current?.id === group.id ? null : current));
        },
      },
    ]);
  }, []);

  useEffect(() => {
    if (activeGroup && !groups.some((g) => g.id === activeGroup.id)) {
      setActiveGroup(null);
    }
  }, [groups, activeGroup]);

  const currentMessages = activeGroup ? messagesByGroup[activeGroup.id] || [] : [];

  const handleSend = useCallback(
    (text: string) => {
      if (!activeGroup) return;
      const stamp = Date.now();
      const timestamp = new Date(stamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      const nextMessage: ChatMessage = {
        id: `${activeGroup.id}-${stamp}`,
        sender: 'You',
        text,
        timestamp,
        fromMe: true,
      };

      setMessagesByGroup((prev) => {
        const history = prev[activeGroup.id] || [];
        return {
          ...prev,
          [activeGroup.id]: [...history, nextMessage],
        };
      });
    },
    [activeGroup],
  );

  const renderGroupsPage = () => (
    <View style={styles.content}>
      <Text style={styles.screenTitle}>Groups</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreateGroup} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Create New Group</Text>
      </TouchableOpacity>

      <View style={styles.joinBlock}>
        <Text style={styles.joinLabel}>Join a Group.</Text>
        <TextInput
          style={styles.codeInput}
          placeholder="Enter Group Code"
          placeholderTextColor="#b0b0b0"
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TouchableOpacity style={[styles.primaryButton, styles.joinButton]} onPress={handleJoinGroup} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Join Group</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Groups</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard id={item.id} name={item.name} code={item.code} onPress={() => handleSelectGroup(item)} />
        )}
        showsVerticalScrollIndicator={false}
        style={styles.groupsList}
        contentContainerStyle={styles.groupsListContent}
      />

      <View style={styles.listHint}>
        <Text style={styles.listHintText}>Tap a group to open the chat.</Text>
      </View>
    </View>
  );

  const renderChatPage = () => (
    <View style={styles.chatPage}>
      <View style={styles.chatTopBar}>
        <TouchableOpacity onPress={() => setActiveGroup(null)} activeOpacity={0.7}>
          <Text style={styles.backLink}>Back to Groups</Text>
        </TouchableOpacity>
        <Text style={styles.chatTopTitle}>{activeGroup?.name ?? ''} Chat</Text>
        <TouchableOpacity onPress={() => activeGroup && confirmLeaveGroup(activeGroup)} activeOpacity={0.8}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chatTopCode}>Code: {activeGroup?.code}</Text>

      <View style={styles.chatMessagesWrap}>
        {currentMessages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>Say hi to your group to start the conversation.</Text>
          </View>
        ) : (
          <FlatList
            data={currentMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      <ChatInput onSend={handleSend} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        {activeGroup ? renderChatPage() : renderGroupsPage()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#2a2a2a',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#0C78F2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  joinBlock: {
    marginBottom: 10,
  },
  joinLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    color: '#111',
    fontSize: 16,
    marginBottom: 12,
  },
  joinButton: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  groupsList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  groupsListContent: {
    paddingBottom: 8,
  },
  listHint: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listHintText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  chatPage: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chatTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLink: {
    color: '#0C78F2',
    fontWeight: '600',
  },
  chatTopTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  chatTopCode: {
    marginTop: 8,
    color: '#4b5563',
  },
  chatMessagesWrap: {
    flex: 1,
    marginBottom: 8,
  },
  messageList: {
    paddingBottom: 12,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatText: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  leaveText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
