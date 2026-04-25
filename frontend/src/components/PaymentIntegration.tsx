import React, { useState, useEffect } from 'react';
import { PaymentFormData, Transaction, PaymentStatus } from '../types';
import { PaymentForm } from './PaymentForm';
import { TransactionHistoryComponent } from './TransactionHistory';
import { WalletConnector } from './WalletConnector';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Wallet,
  Shield,
  Info
} from 'lucide-react';

interface PaymentIntegrationProps {
  className?: string;
}

interface PaymentConfirmation {
  id: string;
  meterNumber: string;
  amount: string;
  fee: string;
  total: string;
  timestamp: Date;
  stellarTransactionId?: string;
  status: PaymentStatus;
}

interface StellarAccount {
  publicKey: string;
  balance: string;
  network: 'testnet' | 'mainnet';
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({ className = '' }) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'confirmation' | 'processing' | 'success' | 'error'>('form');
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [confirmation, setConfirmation] = useState<PaymentConfirmation | null>(null);
  const [stellarAccount, setStellarAccount] = useState<StellarAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize Stellar SDK
  useEffect(() => {
    // Check if wallet is already connected
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check for Freighter wallet
      if (window.freighter) {
        const isConnected = await window.freighter.isConnected();
        if (isConnected) {
          const publicKey = await window.freighter.getPublicKey();
          await loadAccountDetails(publicKey);
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const loadAccountDetails = async (publicKey: string) => {
    try {
      // For demo purposes, simulate account details
      // In production, this would query the Stellar network
      setStellarAccount({
        publicKey,
        balance: '1000.5000',
        network: 'testnet'
      });
    } catch (err) {
      throw new Error('Failed to load account details');
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.freighter) {
        throw new Error('Freighter wallet is not installed. Please install Freighter to continue.');
      }

      const isConnected = await window.freighter.isConnected();
      if (!isConnected) {
        throw new Error('Please connect your Freighter wallet');
      }

      const publicKey = await window.freighter.getPublicKey();
      await loadAccountDetails(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!stellarAccount) {
      setError('Please connect your wallet first');
      return;
    }

    setPaymentData(data);
    setError(null);

    // Calculate fees
    const fee = calculateTransactionFee(data.amount);
    const total = (parseFloat(data.amount) + fee).toString();

    setConfirmation({
      id: generatePaymentId(),
      meterNumber: data.destination,
      amount: data.amount,
      fee: fee.toString(),
      total,
      timestamp: new Date(),
      status: 'PENDING'
    });

    setCurrentStep('confirmation');
  };

  const calculateTransactionFee = (amount: string): number => {
    // Simulate transaction fee calculation
    const baseFee = 0.001; // Base fee in XLM
    const percentageFee = parseFloat(amount) * 0.005; // 0.5% fee
    return Math.max(baseFee, percentageFee);
  };

  const generatePaymentId = (): string => {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const confirmPayment = async () => {
    if (!paymentData || !confirmation || !stellarAccount) {
      setError('Missing payment information');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCurrentStep('processing');

    try {
      // Create Stellar transaction
      const transaction = await createStellarTransaction(paymentData, confirmation);
      
      // Sign and submit transaction
      const signedTransaction = await window.freighter!.signTransaction(transaction);
      const result = await window.freighter!.submitTransaction(signedTransaction);

      if (result.hash) {
        // Update confirmation with transaction details
        setConfirmation({
          ...confirmation,
          stellarTransactionId: result.hash,
          status: 'SUCCESS'
        });

        // Add to transaction history
        const newTransaction: Transaction = {
          id: confirmation.id,
          meterId: confirmation.meterNumber,
          amount: confirmation.amount,
          status: 'SUCCESS',
          date: confirmation.timestamp.toISOString(),
          transactionHash: result.hash,
          createdAt: confirmation.timestamp,
          updatedAt: confirmation.timestamp,
          fee: confirmation.fee
        };

        setTransactions(prev => [newTransaction, ...prev]);
        setCurrentStep('success');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      setConfirmation({
        ...confirmation,
        status: 'FAILED'
      });
      setCurrentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const createStellarTransaction = async (paymentData: PaymentFormData, confirmation: PaymentConfirmation): Promise<string> => {
    // This is a simplified version - in production, you'd use the Stellar SDK properly
    const server = 'https://horizon-testnet.stellar.org'; // Testnet
    const sourceAccount = stellarAccount!.publicKey;
    const destinationAccount = 'GDQJUQXKZ4X4VYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQYQ'; // Demo destination
    
    // Create transaction object
    const transaction = {
      sourceAccount,
      destinationAccount,
      amount: confirmation.total,
      asset: 'XLM',
      memo: confirmation.id
    };

    // Return a mock transaction for demo
    return JSON.stringify(transaction);
  };

  const resetPayment = () => {
    setCurrentStep('form');
    setPaymentData(null);
    setConfirmation(null);
    setError(null);
  };

  const retryPayment = () => {
    if (confirmation) {
      setCurrentStep('confirmation');
      setError(null);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'form':
        return (
          <div className="space-y-6">
            {/* Wallet Connection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Wallet Status</span>
                </div>
                <WalletConnector
                  address={stellarAccount?.publicKey || null}
                  onConnect={connectWallet}
                />
              </div>
              {stellarAccount && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-medium">{stellarAccount.balance} XLM</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium">{stellarAccount.network}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              isLoading={isProcessing}
            />

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                </div>
                {showHistory && (
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.status === 'SUCCESS' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{transaction.meterId}</p>
                            <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">₦{transaction.amount}</p>
                          <p className="text-xs text-gray-500">{transaction.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
              <p className="text-gray-600">Please review your payment details before confirming</p>
            </div>

            {confirmation && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-medium">{confirmation.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Meter Number:</span>
                  <span className="font-medium">{confirmation.meterNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₦{confirmation.amount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Transaction Fee:</span>
                  <span className="font-medium">₦{confirmation.fee}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">₦{confirmation.total}</span>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Payment Information</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Payment will be processed via Stellar network</li>
                    <li>• Transaction is irreversible once confirmed</li>
                    <li>• You will receive a confirmation receipt</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={resetPayment}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
              <p className="text-gray-600">Your payment is being processed on the Stellar network</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  This usually takes 10-30 seconds. Please don't close this window.
                </p>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">Your payment has been processed successfully</p>
            </div>

            {confirmation && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{confirmation.id}</span>
                </div>
                {confirmation.stellarTransactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stellar TX:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{confirmation.stellarTransactionId.slice(0, 10)}...</span>
                      <button
                        onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${confirmation.stellarTransactionId}`, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">₦{confirmation.total}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={resetPayment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg"
              >
                Make Another Payment
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                View History
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600">We couldn't process your payment</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Error Details</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={resetPayment}
                className="flex-1 border border-gray-300 text-gray-700 font-medium px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                Start Over
              </button>
              <button
                onClick={retryPayment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {error && currentStep === 'form' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {renderStepContent()}

      {showHistory && (
        <div className="mt-8">
          <TransactionHistoryComponent />
        </div>
      )}
    </div>
  );
};

// Extend Window interface for Freighter
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (transaction: string) => Promise<string>;
      submitTransaction: (transaction: string) => Promise<{ hash: string }>;
    };
  }
}

export default PaymentIntegration;
