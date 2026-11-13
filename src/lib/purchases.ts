import { NativeModules, Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PACKAGE_TYPE,
  PurchasesError,
  PurchasesPackage,
  PURCHASES_ERROR_CODE,
} from 'react-native-purchases';

/**
 * REVENUECAT TEST STORE INTEGRATION
 *
 * Configured for RevenueCat Test Store billing using the public test API key
 * provided in EXPO_PUBLIC_REVENUECAT_TEST_API_KEY.
 *
 * This separates Test Store verification from live App Store / Google Play billing.
 * Never commit API keys or log credentials.
 */

export const REVENUECAT_ENTITLEMENT_ID = 'nowly_pro';
export const REVENUECAT_OFFERING_ID = 'default';

export interface PaywallPackages {
  annual: PurchasesPackage | null;
  monthly: PurchasesPackage | null;
}

export interface PackageTrialInfo {
  hasTrial: boolean;
  trialDays?: number;
  trialLabel?: string;
}

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled: boolean;
  customerInfo: CustomerInfo | null;
  error?: Error | PurchasesError | null;
}

export interface RestoreResult {
  success: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  error?: Error | PurchasesError | null;
}

/**
 * Checks whether the native RevenueCat SDK is available in the current runtime.
 * Web or pre-rebuild dev-clients return false so the app never crashes.
 */
export function isPurchasesSupported(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  return Boolean(NativeModules && NativeModules.RNPurchases);
}

let isConfigured = false;

/**
 * Initializes RevenueCat SDK with the Test Store public key from environment.
 * Will not configure twice and handles missing native modules gracefully.
 */
export async function initPurchases(): Promise<boolean> {
  if (!isPurchasesSupported()) {
    return false;
  }

  if (isConfigured) {
    return true;
  }

  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  if (!apiKey) {
    console.warn('[Purchases] EXPO_PUBLIC_REVENUECAT_TEST_API_KEY is not defined.');
    return false;
  }

  try {
    const alreadyConfigured = await Purchases.isConfigured();
    if (!alreadyConfigured) {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey });
    }
    isConfigured = true;
    return true;
  } catch (error) {
    console.warn('[Purchases] Failed to configure RevenueCat:', error);
    return false;
  }
}

/**
 * Checks if the customer currently has an active 'nowly_pro' entitlement.
 * Premium access is granted ONLY if nowly_pro is present and active.
 */
export function isNowlyProActive(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo || !customerInfo.entitlements || !customerInfo.entitlements.active) {
    return false;
  }
  const entitlement = customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  return Boolean(entitlement && entitlement.isActive);
}

/**
 * Checks the current entitlement status directly from RevenueCat.
 */
export async function checkProEntitlement(): Promise<boolean> {
  const ready = await initPurchases();
  if (!ready) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return isNowlyProActive(customerInfo);
  } catch (error) {
    console.warn('[Purchases] Error checking customer entitlement:', error);
    return false;
  }
}

/**
 * Helper to identify lifetime package so it remains completely hidden from paywall.
 */
function isLifetimePackage(pkg: PurchasesPackage): boolean {
  const identifier = (pkg.identifier || '').toLowerCase();
  const productIdentifier = (pkg.product?.identifier || '').toLowerCase();
  return (
    identifier.includes('lifetime') ||
    productIdentifier.includes('lifetime') ||
    pkg.packageType === PACKAGE_TYPE.LIFETIME
  );
}

/**
 * Loads the paywall packages from the 'default' offering.
 * Filters out the lifetime package and extracts annual and monthly packages.
 */
export async function getPaywallPackages(): Promise<{
  packages: PaywallPackages;
  isSupported: boolean;
  error?: string;
}> {
  const ready = await initPurchases();
  if (!ready) {
    return {
      packages: { annual: null, monthly: null },
      isSupported: isPurchasesSupported(),
      error: !isPurchasesSupported()
        ? 'Native in-app purchase module not present in this build.'
        : 'RevenueCat Test Store key not configured.',
    };
  }

  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[REVENUECAT_OFFERING_ID] || offerings.current;

    if (!offering || !offering.availablePackages || offering.availablePackages.length === 0) {
      return {
        packages: { annual: null, monthly: null },
        isSupported: true,
        error: 'No packages found in offering.',
      };
    }

    // Filter out lifetime product completely
    const visiblePackages = offering.availablePackages.filter((p) => !isLifetimePackage(p));

    let annual: PurchasesPackage | null = null;
    let monthly: PurchasesPackage | null = null;

    for (const pkg of visiblePackages) {
      const pkgId = pkg.identifier.toLowerCase();
      const prodId = (pkg.product?.identifier || '').toLowerCase();

      // Check annual package ($rc_annual or yearly)
      if (
        pkg.packageType === PACKAGE_TYPE.ANNUAL ||
        pkgId.includes('annual') ||
        prodId === 'yearly'
      ) {
        annual = pkg;
        continue;
      }

      // Check monthly package ($rc_monthly or monthly)
      if (
        pkg.packageType === PACKAGE_TYPE.MONTHLY ||
        pkgId.includes('monthly') ||
        prodId === 'monthly'
      ) {
        monthly = pkg;
        continue;
      }
    }

    return {
      packages: { annual, monthly },
      isSupported: true,
    };
  } catch (error: any) {
    console.warn('[Purchases] Error loading offerings:', error?.message || error);
    return {
      packages: { annual: null, monthly: null },
      isSupported: true,
      error: error?.message || 'Failed to fetch packages from RevenueCat.',
    };
  }
}

/**
 * Detects whether a package provides a legitimate free trial period.
 * Does NOT guess or invent trial durations.
 */
export function detectPackageTrial(pkg: PurchasesPackage | null): PackageTrialInfo {
  if (!pkg || !pkg.product) {
    return { hasTrial: false };
  }

  // 1. Check iOS / StoreKit / Test Store intro price
  const intro = pkg.product.introPrice;
  if (intro && (intro.price === 0 || intro.priceString.includes('0.00'))) {
    const units = intro.periodNumberOfUnits ?? 0;
    const unit = (intro.periodUnit || '').toUpperCase();

    let days = 0;
    if (unit === 'DAY') days = units;
    else if (unit === 'WEEK') days = units * 7;
    else if (unit === 'MONTH') days = units * 30;
    else if (unit === 'YEAR') days = units * 365;

    if (days > 0) {
      return {
        hasTrial: true,
        trialDays: days,
        trialLabel: `${days}-day free trial`,
      };
    }

    return {
      hasTrial: true,
      trialLabel: 'Free trial',
    };
  }

  // 2. Check Google Play subscription default option free phase
  const defaultOption = pkg.product.defaultOption;
  if (defaultOption && defaultOption.freePhase) {
    const period = defaultOption.freePhase.billingPeriod;
    let days = 0;
    if (period && period.iso8601) {
      const matchDays = period.iso8601.match(/P(\d+)D/);
      const matchWeeks = period.iso8601.match(/P(\d+)W/);
      const matchMonths = period.iso8601.match(/P(\d+)M/);
      if (matchDays) days = parseInt(matchDays[1], 10);
      else if (matchWeeks) days = parseInt(matchWeeks[1], 10) * 7;
      else if (matchMonths) days = parseInt(matchMonths[1], 10) * 30;
    }
    return {
      hasTrial: true,
      trialDays: days > 0 ? days : undefined,
      trialLabel: days > 0 ? `${days}-day free trial` : 'Free trial',
    };
  }

  return { hasTrial: false };
}

/**
 * Purchases the specified package.
 * Gracefully handles user cancellation, errors, and verifies nowly_pro entitlement.
 */
export async function purchasePlanPackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!isPurchasesSupported()) {
    return {
      success: false,
      isPro: false,
      userCancelled: false,
      customerInfo: null,
      error: new Error('In-app purchases are not supported in this environment.'),
    };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = isNowlyProActive(customerInfo);
    return {
      success: isPro,
      isPro,
      userCancelled: false,
      customerInfo,
    };
  } catch (error: any) {
    const isCancelled =
      error?.userCancelled === true ||
      error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
      error?.code === '1';

    return {
      success: false,
      isPro: false,
      userCancelled: isCancelled,
      customerInfo: null,
      error,
    };
  }
}

/**
 * Restores previous purchases and verifies if nowly_pro entitlement is active.
 */
export async function restoreUserPurchases(): Promise<RestoreResult> {
  if (!isPurchasesSupported()) {
    return {
      success: false,
      isPro: false,
      customerInfo: null,
      error: new Error('In-app purchases are not supported in this environment.'),
    };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = isNowlyProActive(customerInfo);
    return {
      success: true,
      isPro,
      customerInfo,
    };
  } catch (error: any) {
    return {
      success: false,
      isPro: false,
      customerInfo: null,
      error,
    };
  }
}
