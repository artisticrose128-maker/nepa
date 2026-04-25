import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Transaction, 
  PaymentStatus, 
  TransactionStatus, 
  TransactionStep, 
  PaymentFormData,
  TransactionHistory,
  TransactionFilters,
  ReceiptData
} from '../types';
import { transactionService } from '../services/transactionService';

interface PaymentContextType {
  // Transaction state
  currentTransaction: Transaction | null;
  transactionStatus: TransactionStatus;
  transactionStep: TransactionStep;
  transactionError: string | null;
  
  // Payment processing
  isProcessing: boolean;
  processPayment: (paymentData: PaymentFormData) => Promise<{ success: boolean; transaction?: Transaction; error?: string }>;
  
  // Transaction history
  transactionHistory: TransactionHistory | null;
  isLoadingHistory: boolean;
  fetchTransactionHistory: (filters?: TransactionFilters) => Promise<void>;
  
  // Receipt management
  currentReceipt: ReceiptData | null;
  generateReceipt: (transactionId: string) => Promise<{ success: boolean; receipt?: ReceiptData; error?: string }>;
  
  // Payment methods
  paymentMethods: string[];
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (method: string) => void;
  
  // Utility functions
  resetPaymentState: () => void;
  clearTransactionError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('idle');
  const [transactionStep, setTransactionStep] = useState<TransactionStep>(TransactionStep.IDLE);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
  
  const [paymentMethods] = useState(['stellar', 'bank_transfer', 'credit_card', 'mobile_money']);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const persistedPaymentMethod = localStorage.getItem('nepa-payment-method');
        if (persistedPaymentMethod && paymentMethods.includes(persistedPaymentMethod)) {
          setSelectedPaymentMethod(persistedPaymentMethod);
        }
      } catch (error) {
        console.error('Failed to load persisted payment state:', error);
      }
    };

    loadPersistedState();
  }, [paymentMethods]);

  // Persist selected payment method
  useEffect(() => {
    if (selectedPaymentMethod) {
      localStorage.setItem('nepa-payment-method', selectedPaymentMethod);
    }
  }, [selectedPaymentMethod]);

  const processPayment = async (paymentData: PaymentFormData) => {
    setIsProcessing(true);
    setTransactionStatus('loading');
    setTransactionError(null);
    setTransactionStep(TransactionStep.CONNECTING);

    try {
      // Simulate payment processing steps
      setTransactionStep(TransactionStep.CONNECTING);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTransactionStep(TransactionStep.SIGNING);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setTransactionStep(TransactionStep.SUBMITTING);
      const result = await transactionService.createTransaction(paymentData);
      
      if (result.success && result.transaction) {
        setTransactionStep(TransactionStep.FINALIZING);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTransactionStep(TransactionStep.COMPLETE);
        setCurrentTransaction(result.transaction);
        setTransactionStatus('success');
        
        // Refresh transaction history
        fetchTransactionHistory();
        
        return { success: true, transaction: result.transaction };
      } else {
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setTransactionError(errorMessage);
      setTransactionStatus('error');
      setTransactionStep(TransactionStep.IDLE);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchTransactionHistory = async (filters?: TransactionFilters) => {
    setIsLoadingHistory(true);
    try {
      const result = await transactionService.getTransactionHistory(filters);
      if (result.success && result.history) {
        setTransactionHistory(result.history);
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const generateReceipt = async (transactionId: string) => {
    try {
      const result = await transactionService.generateReceipt(transactionId);
      if (result.success && result.receipt) {
        setCurrentReceipt(result.receipt);
        return { success: true, receipt: result.receipt };
      }
      return { success: false, error: result.error || 'Failed to generate receipt' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate receipt';
      return { success: false, error: errorMessage };
    }
  };

  const resetPaymentState = () => {
    setCurrentTransaction(null);
    setTransactionStatus('idle');
    setTransactionStep(TransactionStep.IDLE);
    setTransactionError(null);
    setIsProcessing(false);
    setCurrentReceipt(null);
  };

  const clearTransactionError = () => {
    setTransactionError(null);
  };

  const value: PaymentContextType = {
    currentTransaction,
    transactionStatus,
    transactionStep,
    transactionError,
    isProcessing,
    processPayment,
    transactionHistory,
    isLoadingHistory,
    fetchTransactionHistory,
    currentReceipt,
    generateReceipt,
    paymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    resetPaymentState,
    clearTransactionError,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
