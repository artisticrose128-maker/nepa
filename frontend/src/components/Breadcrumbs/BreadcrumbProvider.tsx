import React, { createContext, useContext, ReactNode } from 'react';
import { BreadcrumbItem } from './BreadcrumbItem';

export interface BreadcrumbContextType {
  items: BreadcrumbItem[];
  addItem: (item: BreadcrumbItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BreadcrumbItem>) => void;
  clearItems: () => void;
  setItems: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export interface BreadcrumbProviderProps {
  children: ReactNode;
  initialItems?: BreadcrumbItem[];
  maxItems?: number;
  enableAutoGeneration?: boolean;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({
  children,
  initialItems = [],
  maxItems = 5,
  enableAutoGeneration = true
}) => {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems);

  const addItem = (item: BreadcrumbItem) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        // Update existing item
        const newItems = [...prev];
        newItems[existingIndex] = item;
        return newItems;
      } else {
        // Add new item
        return [...prev, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BreadcrumbItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const clearItems = () => {
    setItems([]);
  };

  const contextValue: BreadcrumbContextType = {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems
  };

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};

export default BreadcrumbProvider;
