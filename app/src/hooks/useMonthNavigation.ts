import { useState, useCallback, useMemo } from "react";
import { format, addMonths, subMonths, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UseMonthNavigationReturn {
  currentMonth: string;
  currentMonthLabel: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToMonth: (monthYear: string) => void;
}

export function useMonthNavigation(): UseMonthNavigationReturn {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const currentMonth = useMemo(
    () => format(currentDate, "yyyy-MM"),

    [currentDate],
  );

  const currentMonthLabel = useMemo(() => {
    const formatted = format(currentDate, "MMMM yyyy", { locale: ptBR });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [currentDate]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const goToMonth = useCallback((monthYear: string) => {
    const parsed = parse(monthYear, "yyyy-MM", new Date());

    setCurrentDate(parsed);
  }, []);

  return {
    currentMonth,
    currentMonthLabel,
    goToPreviousMonth,
    goToNextMonth,
    goToMonth,
  };
}