import React, { createContext, useState, useContext, useMemo } from 'react';

// Define the shape of the context data
interface DateContextType {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedYear: number;
  selectedMonth: number;
}

// Create the context with a default value
const DateContext = createContext<DateContextType | undefined>(undefined);

// Create the provider component
export const DateProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const selectedMonth = useMemo(() => currentDate.getMonth() + 1, [currentDate]);

  const value = {
    currentDate,
    setCurrentDate,
    selectedYear,
    selectedMonth,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};

// Create a custom hook for easy access to the context
export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};
