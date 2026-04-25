import { Request, Response } from 'express';
import { BillingService } from '../BillingService';
import { paymentLimiter, transactionLimiter } from '../middleware/rateLimiter';
import { conditionalCaptcha } from '../middleware/captcha';
import { abuseDetector } from '../middleware/abuseDetection';
import { invalidateUserCache, invalidateCacheByPattern } from '../middleware/cache';
import { Server, TransactionBuilder, Networks, BASE_FEE, Asset, Keypair } from 'stellar-sdk';

const billingService = new BillingService();

// Stellar configuration
const stellarServer = new Server('https://horizon-testnet.stellar.org');
const stellarNetwork = Networks.TESTNET;
const STELLAR_ASSET = Asset.native(); // Using XLM as the primary asset

// Transaction status tracking
interface TransactionStatus {
  id: string;
  userId: string;
  billId: string;
  amount: number;
  paymentMethod: string;
  stellarTransactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

// In-memory transaction status store (in production, use Redis or database)
const transactionStatusStore = new Map<string, TransactionStatus>();

// Apply rate limiting and security to all payment routes
export const applyPaymentSecurity = [
  abuseDetector,
  paymentLimiter,
  transactionLimiter,
  conditionalCaptcha
];

/**
 * @openapi
 * /api/payment/process:
 *   post:
 *     summary: Process a payment
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               billId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, CREDIT_CARD, CRYPTO]
 *               recaptchaToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       429:
 *         description: Rate limit exceeded
 *       400:
 *         description: Invalid payment data
 */
export const processPayment = async (req: Request, res: Response) => {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { billId, amount, paymentMethod, stellarSecretKey } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 401,
        error: 'User authentication required'
      });
    }
    
    // Validate payment data
    if (!billId || !amount || !paymentMethod) {
      return res.status(400).json({
        status: 400,
        error: 'Missing required payment fields'
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        status: 400,
        error: 'Payment amount must be greater than 0'
      });
    }

    // Initialize transaction status
    const transactionStatus: TransactionStatus = {
      id: transactionId,
      userId,
      billId,
      amount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    transactionStatusStore.set(transactionId, transactionStatus);

    let paymentResult;
    let stellarTransactionId: string | undefined;

    // Handle Stellar blockchain payments
    if (paymentMethod === 'STELLAR') {
      if (!stellarSecretKey) {
        throw new Error('Stellar secret key is required for Stellar payments');
      }

      // Update status to processing
      transactionStatus.status = 'processing';
      transactionStatus.updatedAt = new Date();

      try {
        const sourceKeypair = Keypair.fromSecret(stellarSecretKey);
        const sourceAccount = await stellarServer.loadAccount(sourceKeypair.publicKey());
        
        // Create Stellar transaction
        const transaction = new TransactionBuilder(sourceAccount, {
          fee: BASE_FEE,
          networkPassphrase: stellarNetwork
        })
          .addOperation({
            type: 'payment',
            destination: process.env.STELLAR_MERCHANT_WALLET || 'GATESTNETACCOUNT',
            asset: STELLAR_ASSET,
            amount: (amount * 10000000).toString(), // Convert to stroops (7 decimal places)
          })
          .setTimeout(30)
          .build();

        transaction.sign(sourceKeypair);
        
        // Submit transaction to Stellar network
        const stellarResult = await stellarServer.submitTransaction(transaction);
        stellarTransactionId = stellarResult.hash;
        
        // Verify transaction was successful
        const transactionRecord = await stellarServer.transactions()
          .transaction(stellarTransactionId)
          .call();

        if (!transactionRecord.successful) {
          throw new Error('Stellar transaction failed on network');
        }

        paymentResult = {
          ...await billingService.processPayment({
            billId,
            userId,
            amount,
            paymentMethod,
            timestamp: new Date(),
            transactionId: stellarTransactionId
          }),
          stellarTransactionId,
          network: 'testnet'
        };

        transactionStatus.status = 'completed';
        transactionStatus.stellarTransactionId = stellarTransactionId;

      } catch (stellarError: any) {
        console.error('Stellar payment error:', stellarError);
        transactionStatus.status = 'failed';
        transactionStatus.errorMessage = stellarError.message || 'Stellar transaction failed';
        
        return res.status(400).json({
          status: 400,
          error: 'Stellar payment processing failed',
          details: stellarError.message,
          transactionId
        });
      }
    } else {
      // Handle traditional payment methods
      paymentResult = await billingService.processPayment({
        billId,
        userId,
        amount,
        paymentMethod,
        timestamp: new Date()
      });
      transactionStatus.status = 'completed';
    }
    
    transactionStatus.updatedAt = new Date();
    
    // Invalidate user cache and payment cache after payment processing
    await invalidateUserCache(userId);
    await invalidateCacheByPattern('payment');
    
    res.status(200).json({
      status: 200,
      message: 'Payment processed successfully',
      data: {
        ...paymentResult,
        transactionId,
        status: transactionStatus.status,
        stellarTransactionId
      }
    });
    
  } catch (error: any) {
    console.error('Payment processing error:', error);
    
    // Update transaction status to failed
    const failedTransaction = transactionStatusStore.get(transactionId);
    if (failedTransaction) {
      failedTransaction.status = 'failed';
      failedTransaction.errorMessage = error.message || 'Unknown error';
      failedTransaction.updatedAt = new Date();
    }
    
    res.status(500).json({
      status: 500,
      error: 'Payment processing failed',
      message: error.message,
      transactionId
    });
  }
};

/**
 * @openapi
 * /api/payment/history:
 *   get:
 *     summary: Get payment history for a user
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!userId) {
      return res.status(401).json({
        status: 401,
        error: 'User authentication required'
      });
    }
    
    const paymentHistory = await billingService.getPaymentHistory(userId, limit, offset);
    
    res.status(200).json({
      status: 200,
      data: paymentHistory.payments,
      pagination: paymentHistory.pagination
    });
    
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve payment history'
    });
  }
};

/**
 * @openapi
 * /api/payment/validate:
 *   post:
 *     summary: Validate payment data before processing
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               billId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment data is valid
 */
export const validatePayment = async (req: Request, res: Response) => {
  try {
    const { billId, amount } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 401,
        error: 'User authentication required'
      });
    }
    
    // Validate bill exists and belongs to user
    const bill = await billingService.getBill(billId);
    if (!bill || bill.userId !== userId) {
      return res.status(404).json({
        status: 404,
        error: 'Bill not found or access denied'
      });
    }
    
    // Validate amount
    if (amount <= 0 || amount > Number(bill.amount) + Number(bill.lateFee || 0)) {
      return res.status(400).json({
        status: 400,
        error: 'Invalid payment amount'
      });
    }
    
    res.status(200).json({
      status: 200,
      message: 'Payment data is valid',
      data: {
        billAmount: bill.amount,
        lateFee: bill.lateFee,
        totalDue: Number(bill.amount) + Number(bill.lateFee || 0)
      }
    });
    
  } catch (error) {
    console.error('Payment validation error:', error);
    res.status(500).json({
      status: 500,
      error: 'Payment validation failed'
    });
  }
};

/**
 * @openapi
 * /api/payment/status/{transactionId}:
 *   get:
 *     summary: Get transaction status
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *       404:
 *         description: Transaction not found
 */
export const getTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 401,
        error: 'User authentication required'
      });
    }
    
    const transaction = transactionStatusStore.get(transactionId);
    
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({
        status: 404,
        error: 'Transaction not found or access denied'
      });
    }
    
    // For Stellar transactions, check network status
    if (transaction.stellarTransactionId && transaction.status === 'processing') {
      try {
        const stellarTx = await stellarServer.transactions()
          .transaction(transaction.stellarTransactionId)
          .call();
        
        if (stellarTx.successful) {
          transaction.status = 'completed';
          transaction.updatedAt = new Date();
        } else if (stellarTx.status === 'failed') {
          transaction.status = 'failed';
          transaction.errorMessage = 'Stellar transaction failed on network';
          transaction.updatedAt = new Date();
        }
      } catch (error) {
        console.error('Error checking Stellar transaction:', error);
      }
    }
    
    res.status(200).json({
      status: 200,
      data: transaction
    });
    
  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to retrieve transaction status'
    });
  }
};
