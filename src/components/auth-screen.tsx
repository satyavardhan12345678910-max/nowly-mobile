import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  resetPasswordForEmail,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/auth';

// Official Google multi-color SVG icon as data URI
const GOOGLE_ICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
</svg>
`)}`;

// Clean outline SVGs for inputs
const MAIL_ICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#737B8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="20" height="16" x="2" y="4" rx="2"/>
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
</svg>
`)}`;

const LOCK_ICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#737B8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>
`)}`;

const EYE_ICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#737B8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
  <circle cx="12" cy="12" r="3"/>
</svg>
`)}`;

const EYE_OFF_ICON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#737B8C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m2 2 20 20"/>
  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
</svg>
`)}`;

type AuthMode = 'login' | 'signup';

export function AuthScreen() {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validateInputs = (): boolean => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }

    if (mode === 'signup' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  const handlePrimaryAction = async () => {
    if (isLoading || isGoogleLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateInputs()) return;

    const trimmedEmail = email.trim();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signInWithEmail(trimmedEmail, password);

        if (error) {
          if (
            error.message.toLowerCase().includes('invalid login credentials') ||
            error.message.toLowerCase().includes('invalid credentials')
          ) {
            setErrorMessage('Invalid email or password. Please try again.');
          } else if (
            error.message.toLowerCase().includes('email not confirmed')
          ) {
            setErrorMessage(
              'Please verify your email address before logging in. Check your inbox.'
            );
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        // Successfully logged in — the AuthProvider listener will update the session automatically
      } else {
        const { data, error } = await signUpWithEmail(trimmedEmail, password);

        if (error) {
          if (
            error.message.toLowerCase().includes('user already registered') ||
            error.message.toLowerCase().includes('already registered')
          ) {
            setErrorMessage(
              'An account with this email already exists. Please log in.'
            );
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        // Check if session returned or email confirmation is required
        if (data.user && !data.session) {
          setSuccessMessage(
            `Account created! A confirmation link has been sent to ${trimmedEmail}. Please check your inbox and verify your email to log in.`
          );
        } else if (data.session) {
          setSuccessMessage('Account created successfully! Welcome to Nowly.');
        }
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('network')) {
        setErrorMessage(
          'Network error. Please check your internet connection and try again.'
        );
      } else {
        setErrorMessage(
          err?.message || 'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage(
        'Please enter your email address in the field above to reset your password.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address to reset your password.');
      return;
    }

    setIsResetLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await resetPasswordForEmail(trimmedEmail);

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          `Password reset instructions sent to ${trimmedEmail}. Please check your inbox.`
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Failed to send password reset email. Please try again.'
      );
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading || isGoogleLoading) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success && !result.cancelled) {
        setErrorMessage('Google sign-in could not be completed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('cancelled') || msg.includes('dismissed')) {
        // User voluntarily dismissed browser
      } else {
        setErrorMessage(
          msg || 'Google sign-in failed. Please verify your connection and try again.'
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Decorative Mint-Green Shapes matching the reference screenshot */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.mintBlobTopLeft} />
        <View style={styles.mintBlobTopRight} />
        <View style={styles.mintBlobMidRight} />
        <View style={styles.mintBlobBottomRight} />
        <View style={styles.mintBlobBottomLeft} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + 12, 32),
                paddingBottom: Math.max(insets.bottom + 16, 28),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.contentWrapper}>
              {/* BRANDING SECTION */}
              <View style={styles.brandingSection}>
                <Image
                  source={require('@/assets/images/nowly-logo.png')}
                  style={styles.logoImage}
                  contentFit="contain"
                  accessibilityLabel="Nowly Logo"
                />
                <Text style={styles.wordmark}>Nowly</Text>
                <Text style={styles.heading}>Real moments.{'\n'}Closer friends.</Text>
                <Text style={styles.subtitle}>
                  See what your close friends are{'\n'}doing right now.
                </Text>
              </View>

              {/* LOGIN / SIGN-UP SEGMENTED CONTROL */}
              <View style={styles.segmentedContainer}>
                <Pressable
                  onPress={() => handleModeChange('login')}
                  style={[
                    styles.segment,
                    mode === 'login' && styles.segmentActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'login' }}
                  accessibilityLabel="Login tab">
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'login' && styles.segmentTextActive,
                    ]}>
                    Login
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleModeChange('signup')}
                  style={[
                    styles.segment,
                    mode === 'signup' && styles.segmentActive,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'signup' }}
                  accessibilityLabel="Sign up tab">
                  <Text
                    style={[
                      styles.segmentText,
                      mode === 'signup' && styles.segmentTextActive,
                    ]}>
                    Sign up
                  </Text>
                </Pressable>
              </View>

              {/* FEEDBACK BANNERS */}
              {errorMessage && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              )}

              {successMessage && (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>{successMessage}</Text>
                </View>
              )}

              {/* FORM FIELDS */}
              <View style={styles.formContainer}>
                {/* EMAIL FIELD */}
                <View style={styles.inputPill}>
                  <View style={styles.inputIconContainer}>
                    <Image
                      source={{ uri: MAIL_ICON_URI }}
                      style={styles.inputIcon}
                      contentFit="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!isLoading && !isGoogleLoading}
                  />
                </View>

                {/* PASSWORD FIELD */}
                <View style={styles.inputPill}>
                  <View style={styles.inputIconContainer}>
                    <Image
                      source={{ uri: LOCK_ICON_URI }}
                      style={styles.inputIcon}
                      contentFit="contain"
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    editable={!isLoading && !isGoogleLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? 'Hide password' : 'Show password'
                    }>
                    <Image
                      source={{ uri: showPassword ? EYE_OFF_ICON_URI : EYE_ICON_URI }}
                      style={styles.eyeIcon}
                      contentFit="contain"
                    />
                  </Pressable>
                </View>

                {/* FORGOT PASSWORD (LOGIN MODE ONLY) */}
                {mode === 'login' && (
                  <View style={styles.forgotPasswordContainer}>
                    <Pressable
                      onPress={handleForgotPassword}
                      disabled={isResetLoading}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password?">
                      <Text style={styles.forgotPasswordText}>
                        {isResetLoading ? 'Sending link...' : 'Forgot password?'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {/* PRIMARY ACTION BUTTON */}
                <Pressable
                  onPress={handlePrimaryAction}
                  disabled={isLoading || isGoogleLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    (pressed || isLoading) && styles.primaryButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === 'login' ? 'Log in' : 'Create account'
                  }>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {mode === 'login' ? 'Log in  →' : 'Create account  →'}
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* OR CONTINUE WITH DIVIDER */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* ALTERNATIVE AUTHENTICATION (GOOGLE) */}
              <View style={styles.altAuthContainer}>
                <Pressable
                  onPress={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && styles.googleButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Google">
                  {isGoogleLoading ? (
                    <ActivityIndicator color="#111113" size="small" />
                  ) : (
                    <>
                      <Image
                        source={{ uri: GOOGLE_ICON_URI }}
                        style={styles.googleIcon}
                        contentFit="contain"
                      />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              {/* BOTTOM SIGN-UP / LOGIN PROMPT */}
              <View style={styles.bottomPromptContainer}>
                {mode === 'login' ? (
                  <Text style={styles.bottomPromptText}>
                    Don&apos;t have an account?{' '}
                    <Text
                      style={styles.bottomPromptHighlight}
                      onPress={() => handleModeChange('signup')}>
                      Sign up
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.bottomPromptText}>
                    Already have an account?{' '}
                    <Text
                      style={styles.bottomPromptHighlight}
                      onPress={() => handleModeChange('login')}>
                      Log in
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  /* Decorative Mint Corner Blobs */
  mintBlobTopLeft: {
    position: 'absolute',
    top: -45,
    left: -45,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#D1FAE5',
    opacity: 0.6,
  },
  mintBlobTopRight: {
    position: 'absolute',
    top: 130,
    right: -70,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E6FAF2',
    opacity: 0.7,
  },
  mintBlobMidRight: {
    position: 'absolute',
    top: 330,
    right: -55,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#D1FAE5',
    opacity: 0.5,
  },
  mintBlobBottomRight: {
    position: 'absolute',
    bottom: -45,
    right: -35,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#D1FAE5',
    opacity: 0.65,
  },
  mintBlobBottomLeft: {
    position: 'absolute',
    bottom: 35,
    left: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E6FAF2',
    opacity: 0.55,
  },

  /* BRANDING */
  brandingSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  logoImage: {
    width: 76,
    height: 76,
    borderRadius: 20,
    marginBottom: 6,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  heading: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#737B8C',
    textAlign: 'center',
  },

  /* SEGMENTED CONTROL */
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF0F3',
    borderRadius: 9999,
    padding: 4,
    marginTop: 22,
    marginBottom: 16,
    width: '100%',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#111113',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555B68',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* BANNERS */
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  successBannerText: {
    color: '#065F46',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* FORM INPUTS */
  formContainer: {
    gap: 12,
    width: '100%',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E8EAED',
    height: 52,
    paddingHorizontal: 16,
  },
  inputIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputIcon: {
    width: 18,
    height: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111113',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -2,
    marginBottom: 4,
    paddingRight: 6,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#555B68',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },

  /* PRIMARY BUTTON */
  primaryButton: {
    backgroundColor: '#111113',
    borderRadius: 9999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#111113',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonPressed: {
    backgroundColor: '#2D2F36',
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /* DIVIDER */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginHorizontal: 12,
  },

  /* ALTERNATIVE AUTH (GOOGLE) */
  altAuthContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
    borderColor: '#E8EAED',
    borderWidth: 1,
    borderRadius: 9999,
    height: 52,
    width: '100%',
    gap: 10,
  },
  googleButtonPressed: {
    backgroundColor: '#ECEEF2',
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111113',
  },

  /* BOTTOM PROMPT */
  bottomPromptContainer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPromptText: {
    fontSize: 13,
    color: '#555B68',
    textAlign: 'center',
  },
  bottomPromptHighlight: {
    color: '#111113',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
