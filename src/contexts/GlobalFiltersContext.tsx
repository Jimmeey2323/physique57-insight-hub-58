
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPreviousMonthDateRange } from '@/utils/dateUtils';

interface GlobalFilters {
  dateRange: {
    start: string;
    end: string;
  };
  location: string[];
  category: string[];
  product: string[];
  soldBy: string[];
  paymentMethod: string[];
  source: string[];
  associate: string[];
  stage: string[];
  status: string[];
  channel: string[];
  trialStatus: string[];
  conversionStatus: string[];
  retentionStatus: string[];
  minLTV?: number;
  maxLTV?: number;
}

interface GlobalFiltersContextType {
  filters: GlobalFilters;
  updateFilters: (newFilters: Partial<GlobalFilters>) => void;
  clearFilters: () => void;
  resetToDefaultDates: () => void;
}

const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(undefined);

export const useGlobalFilters = () => {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a GlobalFiltersProvider');
  }
  return context;
};

interface GlobalFiltersProviderProps {
  children: ReactNode;
}

const getDefaultFilters = (): GlobalFilters => {
  const previousMonth = getPreviousMonthDateRange();
  return {
    dateRange: previousMonth,
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: [],
    source: [],
    associate: [],
    stage: [],
    status: [],
    channel: [],
    trialStatus: [],
    conversionStatus: [],
    retentionStatus: [],
    minLTV: undefined,
    maxLTV: undefined
  };
};

export const GlobalFiltersProvider: React.FC<GlobalFiltersProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilters>(getDefaultFilters);

  const updateFilters = (newFilters: Partial<GlobalFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(getDefaultFilters());
  };

  const resetToDefaultDates = () => {
    const previousMonth = getPreviousMonthDateRange();
    updateFilters({ dateRange: previousMonth });
  };

  // Reset filters to previous month on mount and when month changes
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentDefault = getDefaultFilters();
      if (filters.dateRange.start !== currentDefault.dateRange.start || 
          filters.dateRange.end !== currentDefault.dateRange.end) {
        resetToDefaultDates();
      }
    }, 24 * 60 * 60 * 1000); // Check daily

    return () => clearInterval(intervalId);
  }, [filters.dateRange]);

  return (
    <GlobalFiltersContext.Provider value={{
      filters,
      updateFilters,
      clearFilters,
      resetToDefaultDates
    }}>
      {children}
    </GlobalFiltersContext.Provider>
  );
};
