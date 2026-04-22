import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import { TutorAPI } from '../../lib/api';
import TypingIndicator from '../../components/ui/TypingIndicator';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

const QUICK_ACTIONS = ['Explain simply', 'Give an example', 'Summarize', 'Quiz me', 'What next?'];

export default function ChatTutorScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await TutorAPI.getChatHistory('mock-session');
    setMessages(history as Message[]);
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const text = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setIsThinking(true);
    scrollToBottom();

    const aiMsg = await TutorAPI.sendMessage('mock-session', text);
    setIsThinking(false);
    setMessages((prev) => [...prev, aiMsg as Message]);
    scrollToBottom();
  };

  const clearChat = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMessages([{ id: 'msg-1', role: 'ai', content: "Hello! I'm your AI Tutor. What would you like to learn today?" }]);
  };

  // Bottom padding: tab bar height (58) + safe area inset
  const bottomSpacing = 58 + insets.bottom;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.avatar}>
            <MaterialIcons name="auto-awesome" size={20} color="#60a5fa" />
          </View>
          <View>
            <Text style={styles.appBarTitle}>Guru</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="delete-sweep" size={22} color="#60a5fa" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) =>
            msg.role === 'ai' ? (
              <View key={msg.id} style={styles.aiBubbleRow}>
                <View style={styles.aiAvatar}>
                  <MaterialIcons name="auto-awesome" size={14} color="#60a5fa" />
                </View>
                <View style={styles.aiBubble}>
                  <Markdown style={markdownStyles}>{msg.content}</Markdown>
                </View>
              </View>
            ) : (
              <View key={msg.id} style={styles.userBubbleRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userBubbleText}>{msg.content}</Text>
                </View>
              </View>
            )
          )}

          {isThinking && <TypingIndicator />}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputArea, { paddingBottom: bottomSpacing + 8 }]}>
          {/* Quick Actions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
            style={styles.quickActions}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action}
                onPress={() => setInputText(action)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Text Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI tutor anything..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isThinking}
              style={[
                styles.sendButton,
                (!inputText.trim() || isThinking) && styles.sendButtonDisabled,
              ]}
            >
              <MaterialIcons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
  },
  onlineText: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  aiBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#005da7',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '82%',
  },
  userBubbleText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 21,
  },
  inputArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  quickActions: {
    marginBottom: 10,
  },
  quickActionsContent: {
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  chipText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#005da7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});

// Markdown renderer styles
const markdownStyles: any = {
  body: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  heading1: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    marginTop: 4,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    marginTop: 8,
  },
  strong: {
    fontWeight: '700',
    color: '#0f172a',
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#005da7',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 14,
    marginVertical: 8,
  },
  code_block: {
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  bullet_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
  },
};
