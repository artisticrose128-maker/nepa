import type { PrismaClient } from '@prisma/client';
import { FraudDetectionService } from './FraudDetectionService';
import { FraudReviewService } from './FraudReviewService';
import { buildTransactionFeatures } from './transactionFeatureBuilder';

let fraudDetectionServiceInstance: FraudDetectionService | null = null;
const reviewServiceByPrisma = new WeakMap<PrismaClient, FraudReviewService>();

/**
 * Singleton access to the TensorFlow.js fraud detection model (real-time scoring 0-100).
 */
export function getFraudDetectionService(): FraudDetectionService {
  if (!fraudDetectionServiceInstance) {
    fraudDetectionServiceInstance = new FraudDetectionService();
  }
  return fraudDetectionServiceInstance;
}

/**
 * Fraud review service with Prisma persistence and optional adaptive learning hook.
 */
export function getFraudReviewService(prisma: PrismaClient): FraudReviewService {
  let service = reviewServiceByPrisma.get(prisma);
  if (!service) {
    const detectionService = getFraudDetectionService();
    service = new FraudReviewService(prisma, detectionService);
    reviewServiceByPrisma.set(prisma, service);
  }
  return service;
}

export { buildTransactionFeatures };
export { FraudDetectionService } from './FraudDetectionService';
export { FraudReviewService } from './FraudReviewService';
export * from './types';
