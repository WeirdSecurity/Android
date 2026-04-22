import React, { useState } from 'react';
import {
  Alert,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const isLoading = signingIn || signingUp;

  async function signInWithEmail() {
    if (!email || !password) {
      setMessage({ text: 'Please enter your email and password.', isError: true });
      return;
    }
    if (!supabase) {
      setMessage({ text: 'Authentication is not configured. Please check your environment setup.', isError: true });
      return;
    }
    setSigningIn(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ text: error.message, isError: true });
    }
    setSigningIn(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      setMessage({ text: 'Please enter your email and password.', isError: true });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }
    if (!supabase) {
      setMessage({ text: 'Authentication is not configured. Please check your environment setup.', isError: true });
      return;
    }
    setSigningUp(true);
    setMessage(null);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ text: error.message, isError: true });
    } else if (!session) {
      setMessage({ text: '✅ Check your inbox to verify your email, then sign in.', isError: false });
    }
    setSigningUp(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconRing}>
              <MaterialIcons name="school" size={38} color="#ffffff" />
            </View>
            <Text style={styles.appName}>AI Tutor</Text>
            <Text style={styles.tagline}>
              Unlock your potential. Sign in or create an account to start learning.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={20} color="#c084fc" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  onChangeText={setEmail}
                  value={email}
                  placeholder="you@example.com"
                  placeholderTextColor="#c084fc"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="lock" size={20} color="#c084fc" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#c084fc"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#c084fc" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Message */}
            {message && (
              <Text style={[styles.message, { color: message.isError ? '#fca5a5' : '#86efac' }]}>
                {message.text}
              </Text>
            )}

            {/* Sign In */}
            <TouchableOpacity style={styles.primaryBtn} onPress={signInWithEmail} disabled={isLoading}>
              {signingIn ? (
                <ActivityIndicator color="#581c87" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up */}
            <TouchableOpacity style={styles.secondaryBtn} onPress={signUpWithEmail} disabled={isLoading}>
              {signingUp ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.secondaryBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4c1d95', // purple-900
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: '#ddd6fe',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 24,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ddd6fe',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    height: 54,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4c1d95',
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});
