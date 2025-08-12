
export const getPreviousMonthDateRange = () => {
  const now = new Date();
  const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  return {
    start: firstDayPreviousMonth.toISOString().split('T')[0],
    end: lastDayPreviousMonth.toISOString().split('T')[0]
  };
};

export const getCurrentMonthDateRange = () => {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: firstDayCurrentMonth.toISOString().split('T')[0],
    end: lastDayCurrentMonth.toISOString().split('T')[0]
  };
};

export const getDateRangeForMonths = (monthsBack: number) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};
