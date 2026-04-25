import type { PrismaClient } from '@prisma/client';
import type { TransactionFeatures } from './types';

const HIGH_RISK_COUNTRIES = new Set(['XX', 'YY']); // Extend with actual high-risk codes
const DEFAULT_NETWORK = 'stellar';
const DEFAULT_CURRENCY = 'USD';

export interface BuildFeaturesInput {
  prisma: PrismaClient;
  userId: string;
  transactionId: string;
  amount: number;
  currency?: string;
  network?: string;
  billId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

/**
 * Build TransactionFeatures for fraud detection from available request and DB data.
 * Used for real-time fraud scoring when processing payments.
 */
export async function buildTransactionFeatures(input: BuildFeaturesInput): Promise<TransactionFeatures> {
  const {
    prisma,
    userId,
    transactionId,
    amount,
    currency = DEFAULT_CURRENCY,
    network = DEFAULT_NETWORK,
    ipAddress = '',
    userAgent = '',
    deviceId = '',
  } = input;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  // User and payment history
  const [user, payments, failedCount, blacklistChecks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, lastLoginAt: true },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { amount: true, createdAt: true, status: true },
    }),
    prisma.payment.count({
      where: { userId, status: 'FAILED' },
    }),
    prisma.fraudBlacklist.findMany({
      where: {
        isActive: true,
        OR: [
          ...(ipAddress ? [{ type: 'ip', value: ipAddress }] : []),
          ...(deviceId ? [{ type: 'device', value: deviceId }] : []),
        ],
      },
    }),
  ]);

  const successPayments = payments.filter((p) => p.status === 'SUCCESS');
  const ts = (d: Date) => d.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const last24h = successPayments.filter((p) => now.getTime() - ts(p.createdAt) < dayMs);
  const last7d = successPayments.filter((p) => now.getTime() - ts(p.createdAt) < 7 * dayMs);
  const last30d = successPayments.filter((p) => now.getTime() - ts(p.createdAt) < 30 * dayMs);

  const sum = (arr: { amount: unknown }[]) =>
    arr.reduce((a, p) => a + Number(p.amount || 0), 0);
  const avgAmount =
    successPayments.length > 0 ? sum(successPayments) / successPayments.length : amount;
  const stdDev =
    successPayments.length > 1
      ? Math.sqrt(
          successPayments.reduce((a, p) => a + (Number(p.amount) - avgAmount) ** 2, 0) / successPayments.length
        )
      : 0;
  const amountDeviation = stdDev > 0 ? Math.min(5, Math.abs(amount - avgAmount) / stdDev) : 0;

  const userAccountAge = user?.createdAt
    ? (now.getTime() - ts(user.createdAt)) / (24 * 60 * 60 * 1000)
    : 0;
  const userLastLoginTime = user?.lastLoginAt ?? now;
  const loginFrequency = 7; // placeholder: logins per week

  const lastTxnTime =
    successPayments.length > 0 ? ts(successPayments[0].createdAt) : now.getTime() - 30 * dayMs;
  const timeSinceLastTransaction = (now.getTime() - lastTxnTime) / (60 * 1000); // minutes
  const transactionVelocity = last24h.length; // simple: txns in last 24h as proxy for velocity

  const avgFrequency = successPayments.length / 30;
  const frequencyDeviation =
    avgFrequency > 0 ? Math.min(5, Math.abs(last24h.length / 24 - avgFrequency) / (avgFrequency || 1)) : 0;

  const isBlacklistedIP = blacklistChecks.some((b) => b.type === 'ip' && b.value === ipAddress);
  const isBlacklistedDevice = blacklistChecks.some((b) => b.type === 'device' && b.value === deviceId);

  return {
    amount,
    currency,
    network,
    timestamp: now,
    userId,

    userTransactionCount24h: last24h.length,
    userTransactionCount7d: last7d.length,
    userTransactionCount30d: last30d.length,
    userAvgTransactionAmount: avgAmount,
    userTotalAmount24h: sum(last24h),
    userTotalAmount7d: sum(last7d),
    userTotalAmount30d: sum(last30d),
    userAccountAge,
    userLastLoginTime,
    userLoginFrequency: loginFrequency,

    ipAddress,
    country: 'US',
    city: '',
    isHighRiskCountry: HIGH_RISK_COUNTRIES.has('US'),
    isVPN: false,
    isTor: false,
    distanceFromLastLocation: 0,
    locationChangeTime: 24 * 30,

    deviceId,
    deviceFingerprint: deviceId || 'unknown',
    userAgent,
    isNewDevice: true,
    deviceAge: 0,
    deviceTransactionCount: successPayments.length,

    hourOfDay: hour,
    dayOfWeek: day,
    isWeekend: day === 0 || day === 6,
    isBusinessHours: hour >= 9 && hour <= 17,
    timeSinceLastTransaction,
    transactionVelocity,

    blockchainNetwork: network,
    isCrossChain: false,
    gasPrice: 0,
    confirmations: 0,
    blockNumber: 0,

    isRecurringPayment: false,
    isUnusualAmount: amountDeviation > 2,
    isUnusualTime: hour < 6 || hour > 22,
    isUnusualLocation: false,
    isUnusualDevice: true,
    amountDeviationFromAvg: amountDeviation,
    frequencyDeviationFromAvg: frequencyDeviation,

    isBlacklistedAddress: false,
    isBlacklistedDevice,
    isBlacklistedIP,
    hasFailedTransactions: failedCount > 0,
    failedTransactionCount: failedCount,
    chargebackHistory: 0,
  };
}
