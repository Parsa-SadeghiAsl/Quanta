import React, { createContext, useState, useContext, useMemo } from 'react';

interface DateContextType {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedYear: number;
  selectedMonth: number;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

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

export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
};
