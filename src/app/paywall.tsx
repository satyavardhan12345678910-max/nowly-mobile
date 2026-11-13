import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { NowlyLogo } from '@/components/nowly-logo';
import {
  detectPackageTrial,
  getPaywallPackages,
  isPurchasesSupported,
  PaywallPackages,
  purchasePlanPackage,
  restoreUserPurchases,
} from '@/lib/purchases';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BENEFITS = [
  'Streak Rescue every 48 hours',
  '2× eligible streak points',
  'Exclusive avatar outfits',
  'Goal rooms for up to 8',
  'Premium badges & wallpapers',
];

export default function NowlyPaywallScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  // RevenueCat packages & operation state
  const [packages, setPackages] = useState<PaywallPackages>({ annual: null, monthly: null });
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch offerings on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const result = await getPaywallPackages();
        if (isMounted) {
          setPackages(result.packages);
          setIsLoadingPackages(false);
        }
      } catch {
        if (isMounted) {
          setIsLoadingPackages(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Android hardware back support
  useEffect(() => {
    const onBack = () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  const handleClose = () => {
    if (params.from === 'onboarding') {
      router.push('/onboarding/intention');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Active package for the selected plan
  const selectedPackage = selectedPlan === 'annual' ? packages.annual : packages.monthly;
  const trialInfo = useMemo(() => detectPackageTrial(selectedPackage), [selectedPackage]);

  // Dynamic pricing strings
  const annualPriceString = packages.annual?.product?.priceString ?? '$14.99';
  const monthlyPriceString = packages.monthly?.product?.priceString ?? '$1.99';

  // Per month breakdown for annual
  const annualPricePerMonthString = useMemo(() => {
    if (packages.annual?.product?.pricePerMonthString) {
      return packages.annual.product.pricePerMonthString;
    }
    if (packages.annual?.product?.price) {
      const perMonth = packages.annual.product.price / 12;
      const currencySymbol = annualPriceString.match(/^[^\d\s]+/)?.[0] || '$';
      return `${currencySymbol}${perMonth.toFixed(2)}`;
    }
    return '$1.25';
  }, [packages.annual, annualPriceString]);

  // Savings percentage vs monthly
  const savingsText = useMemo(() => {
    if (packages.annual?.product?.price && packages.monthly?.product?.price) {
      const annualPrice = packages.annual.product.price;
      const monthlyTotal = packages.monthly.product.price * 12;
      if (monthlyTotal > annualPrice) {
        const pct = Math.round((1 - annualPrice / monthlyTotal) * 100);
        return `Save ${pct}%`;
      }
    }
    return 'Save 37%';
  }, [packages.annual, packages.monthly]);

  // Truthful CTA button label based on actual RevenueCat configuration
  const ctaButtonText = useMemo(() => {
    if (trialInfo.hasTrial) {
      return trialInfo.trialLabel ? `Start ${trialInfo.trialLabel}` : 'Start free trial';
    }
    return 'Subscribe now';
  }, [trialInfo]);

  // Purchase handler
  const handleSubscribe = async () => {
    if (isPurchasing || isRestoring) return;

    if (!isPurchasesSupported()) {
      Alert.alert(
        'Development Build Required',
        'RevenueCat in-app purchases require a native development APK build.\n\nThe native purchases module is not linked in this runtime environment.',
        [
          {
            text: params.from === 'onboarding' ? 'Continue Onboarding' : 'OK',
            onPress: () => {
              if (params.from === 'onboarding') {
                router.push('/onboarding/intention');
              }
            },
          },
        ]
      );
      return;
    }

    if (!selectedPackage) {
      Alert.alert(
        'Plan Unavailable',
        'The selected subscription package is not available right now. Please check your network connection and try again.'
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await purchasePlanPackage(selectedPackage);
      if (result.userCancelled) {
        // Silently return on user cancellation
        return;
      }

      if (result.success && result.isPro) {
        Alert.alert(
          'Welcome to Nowly+!',
          'Your subscription is active. All premium benefits are now unlocked.',
          [
            {
              text: params.from === 'onboarding' ? 'Continue Onboarding' : 'Get Started',
              onPress: handleClose,
            },
          ]
        );
      } else {
        const message =
          result.error?.message ||
          'Your purchase could not be verified with Nowly Pro. Please try restoring your purchase.';
        Alert.alert('Subscription Failed', message);
      }
    } catch (err: any) {
      Alert.alert('Subscription Error', err?.message || 'An unexpected error occurred.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Restore handler
  const handleRestore = async () => {
    if (isRestoring || isPurchasing) return;

    if (!isPurchasesSupported()) {
      Alert.alert(
        'Development Build Required',
        'Restore purchases requires running in a development APK with the native RevenueCat module linked.'
      );
      return;
    }

    setIsRestoring(true);
    try {
      const result = await restoreUserPurchases();
      if (result.isPro) {
        Alert.alert(
          'Purchases Restored',
          'Your Nowly+ subscription was successfully restored.',
          [
            {
              text: params.from === 'onboarding' ? 'Continue Onboarding' : 'OK',
              onPress: handleClose,
            },
          ]
        );
      } else {
        Alert.alert(
          'No Active Subscription Found',
          'We could not find an active Nowly+ subscription associated with your store account.'
        );
      }
    } catch (err: any) {
      Alert.alert('Restore Error', err?.message || 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleReferralInfo = () => {
    Alert.alert(
      'Referral Reward',
      'Invite 10 friends who join Nowly successfully to unlock 1 month of Nowly+ for free!'
    );
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'Nowly subscriptions auto-renew until cancelled in your store account settings.');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy Policy', 'Your privacy is our priority. We never sell your personal data or phone contacts.');
  };

  return (
    <View style={styles.container}>
      {/* Subtle Ambient Sage/Eucalyptus Glow Orbs */}
      <View style={styles.ambientGlowTopLeft} />
      <View style={styles.ambientGlowTopRight} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 8, 20),
            paddingBottom: Math.max(insets.bottom + 16, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* ─── 1. TOP BAR: Close + SPECIAL OFFER badge + Restore ─── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close paywall">
            <Feather name="x" size={18} color="#111113" />
          </Pressable>

          <View style={styles.specialOfferBadge}>
            <View style={styles.specialOfferDot} />
            <Text style={styles.specialOfferText}>SPECIAL OFFER</Text>
          </View>

          <Pressable
            onPress={handleRestore}
            disabled={isRestoring || isPurchasing}
            hitSlop={12}
            style={({ pressed }) => [
              styles.restoreButton,
              (isRestoring || isPurchasing) && styles.restoreButtonDisabled,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases">
            {isRestoring ? (
              <ActivityIndicator size="small" color="#111113" />
            ) : (
              <Text style={styles.restoreButtonText}>Restore</Text>
            )}
          </Pressable>
        </View>

        {/* ─── 2. HERO SECTION: Icon + Wordmark + Tagline ─── */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <NowlyLogo size={72} />
            <View style={styles.plusBadge}>
              <Feather name="plus" size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Nowly</Text>
            <View style={styles.plusPill}>
              <Text style={styles.plusPillText}>PLUS</Text>
            </View>
          </View>

          <Text style={styles.heading}>More life. Less scrolling.</Text>
          <Text style={styles.subheading}>
            Your people, your streaks, your time—on your terms.
          </Text>
        </View>

        {/* ─── 3. BENEFITS CARD ─── */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitsHeader}>
            <Text style={styles.benefitsHeaderText}>EVERY NOWLY+ BENEFIT</Text>
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>UNLOCKED</Text>
            </View>
          </View>

          <View style={styles.benefitsList}>
            {BENEFITS.map((benefit, index) => (
              <View
                key={index}
                style={[
                  styles.benefitRow,
                  index < BENEFITS.length - 1 && styles.benefitRowBorder,
                ]}>
                <View style={styles.checkCircle}>
                  <Feather name="check" size={13} color="#154329" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ─── 4. PLAN SELECTION ─── */}
        <View style={styles.planSection}>
          <Text style={styles.planSectionTitle}>CHOOSE YOUR PLAN</Text>

          {/* Annual Plan Card (Selected by Default) */}
          <Pressable
            onPress={() => setSelectedPlan('annual')}
            style={[
              styles.planCard,
              selectedPlan === 'annual'
                ? styles.planCardSelected
                : styles.planCardUnselected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'annual' }}>
            <View style={styles.planCardLeft}>
              <View
                style={[
                  styles.radioOuter,
                  selectedPlan === 'annual'
                    ? styles.radioOuterSelected
                    : styles.radioOuterUnselected,
                ]}>
                {selectedPlan === 'annual' && <View style={styles.radioInnerSelected} />}
              </View>

              <View style={styles.planTextCol}>
                <Text style={styles.planTitle}>Annual</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{annualPriceString}</Text>
                  <Text style={styles.pricePeriod}>/ year</Text>
                </View>
                <Text style={styles.planSubtext}>
                  Just {annualPricePerMonthString}/month • <Text style={styles.savingsHighlight}>{savingsText}</Text>
                </Text>
              </View>
            </View>

            {/* Best Value Badge */}
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
          </Pressable>

          {/* Monthly Plan Card */}
          <Pressable
            onPress={() => setSelectedPlan('monthly')}
            style={[
              styles.planCard,
              selectedPlan === 'monthly'
                ? styles.planCardSelected
                : styles.planCardUnselected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'monthly' }}>
            <View style={styles.planCardLeft}>
              <View
                style={[
                  styles.radioOuter,
                  selectedPlan === 'monthly'
                    ? styles.radioOuterSelected
                    : styles.radioOuterUnselected,
                ]}>
                {selectedPlan === 'monthly' && <View style={styles.radioInnerSelected} />}
              </View>

              <View style={styles.planTextCol}>
                <Text style={styles.planTitle}>Monthly</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{monthlyPriceString}</Text>
                  <Text style={styles.pricePeriod}>/ month</Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Referral Reward Card */}
          <Pressable
            onPress={handleReferralInfo}
            style={({ pressed }) => [
              styles.referralCard,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Referral reward information">
            <View style={styles.referralLeft}>
              <View style={styles.giftIconContainer}>
                <Feather name="gift" size={18} color="#0E3A24" />
              </View>
              <View style={styles.referralTextCol}>
                <Text style={styles.referralTitle}>Get 1 month free</Text>
                <Text style={styles.referralSubtitle}>
                  Invite 10 friends who join successfully
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* ─── 5. BOTTOM ACTION: Start Free Trial / Subscribe Button ─── */}
        <View style={styles.bottomSection}>
          <Pressable
            onPress={handleSubscribe}
            disabled={isPurchasing || isRestoring}
            style={({ pressed }) => [
              styles.ctaButton,
              (isPurchasing || isRestoring) && styles.ctaButtonDisabled,
              pressed && styles.ctaButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={ctaButtonText}>
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.ctaButtonText}>{ctaButtonText}</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          {/* Footer Terms & Privacy */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Cancel anytime • </Text>
            <Pressable onPress={handleTerms} hitSlop={6}>
              <Text style={styles.footerLink}>Terms</Text>
            </Pressable>
            <Text style={styles.footerText}> • </Text>
            <Pressable onPress={handlePrivacy} hitSlop={6}>
              <Text style={styles.footerLink}>Privacy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF9',
  },
  ambientGlowTopLeft: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E6EFE8',
    opacity: 0.7,
  },
  ambientGlowTopRight: {
    position: 'absolute',
    top: -20,
    right: -40,
    width: 220,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#EEF5EF',
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },

  // 1. Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 12,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFEA',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  specialOfferBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  specialOfferDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
  },
  specialOfferText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: 0.7,
  },
  restoreButton: {
    backgroundColor: '#F1F4F1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
  restoreButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#111113',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  // 2. Hero Section
  heroSection: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#0E3A24',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  brandName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.5,
  },
  plusPill: {
    backgroundColor: '#E3F0E7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  plusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0E3A24',
    letterSpacing: 0.6,
  },
  heading: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: '#111113',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subheading: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 8,
  },

  // 3. Benefits Card
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEA',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    marginBottom: 4,
  },
  benefitsHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  unlockedBadge: {
    backgroundColor: '#E8F5EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unlockedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0E3A24',
    letterSpacing: 0.5,
  },
  benefitsList: {
    marginTop: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8.5,
  },
  benefitRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F6F7F6',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBF6ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  benefitText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111113',
    flex: 1,
    letterSpacing: -0.2,
  },

  // 4. Plan Selection
  planSection: {
    marginTop: 14,
  },
  planSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  planCardSelected: {
    borderWidth: 1.5,
    borderColor: '#0E3A24',
  },
  planCardUnselected: {
    borderWidth: 1,
    borderColor: '#E5E8E4',
  },
  planCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderWidth: 2,
    borderColor: '#0E3A24',
  },
  radioOuterUnselected: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  radioInnerSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0E3A24',
  },
  planTextCol: {
    flex: 1,
  },
  planTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  priceAmount: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111113',
    letterSpacing: -0.6,
  },
  pricePeriod: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  planSubtext: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  savingsHighlight: {
    color: '#0E3A24',
    fontWeight: '700',
  },
  bestValueBadge: {
    backgroundColor: '#073E23',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Referral Reward Card
  referralCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E8E4',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  referralLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  giftIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#EBF6ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTextCol: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111113',
    letterSpacing: -0.2,
  },
  referralSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 1,
  },

  // 5. Bottom Action
  bottomSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0E3A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0E3A24',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaButtonPressed: {
    backgroundColor: '#0A2A1A',
    transform: [{ scale: 0.99 }],
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  footerLink: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
