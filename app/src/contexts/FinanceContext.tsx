import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { format, addMonths, parse } from "date-fns";

import type { Expense, Income, Card, Category } from "../types";

import { CATEGORY_COLORS, getCreditMonthYear } from "../types";

import {
  addExpense as addExpenseService,
  addExpensesBatch,
  updateExpense as updateExpenseService,
  deleteExpense as deleteExpenseService,
  deleteExpensesByGroupIdFromMonth,
  updateExpensesByGroupIdFromMonth,
  getExpensesByMonth,
  getExpensesBeforeMonth,
  addIncome as addIncomeService,
  addIncomesBatch,
  updateIncome as updateIncomeService,
  updateIncomesByGroupIdFromMonth,
  deleteIncome as deleteIncomeService,
  deleteIncomesByGroupIdFromMonth,
  getIncomesByMonth,
  getIncomesBeforeMonth,
  addCard as addCardService,
  getCards as getCardsService,
  deleteCard as deleteCardService,
} from "../services/firestore";

const FIXED_EXPENSE_MONTHS_AHEAD = 12; // gastos fixos replicam 12 meses à frente

interface ExpensesByType {
  fixo: Expense[];

  parcelado: Expense[];

  geral: Expense[];

  guardado: Expense[];
}

interface ExpensesByCard {
  [cardName: string]: Expense[];
}

interface ExpensesByCategory {
  [category: string]: {
    expenses: Expense[];

    total: number;

    color: string;
  };
}

interface IncomesByCard {
  [cardName: string]: Income[];
}

interface FinanceContextType {
  monthYear: string;

  expenses: Expense[];

  incomes: Income[];

  cards: Card[];

  loading: boolean;

  totalExpenses: number;

  totalIncomes: number;

  balance: number;

  previousBalance: number;

  totalBalance: number;

  previousCardBalances: Record<string, number>;

  expensesByType: ExpensesByType;

  expensesByCard: ExpensesByCard;

  expensesByCategory: ExpensesByCategory;

  incomesByCard: IncomesByCard;

  cardSeparateNames: Set<string>;

  setMonthYear: (monthYear: string) => void;

  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;

  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;

  deleteExpense: (id: string) => Promise<void>;

  addIncome: (
    income: Omit<Income, "id">,
    replicateFuture?: boolean,
  ) => Promise<void>;

  updateIncome: (id: string, income: Partial<Income>) => Promise<void>;

  deleteIncome: (id: string) => Promise<void>;

  addCard: (card: Omit<Card, "id">) => Promise<void>;

  deleteCard: (id: string) => Promise<void>;

  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [monthYear, setMonthYear] = useState<string>(
    format(new Date(), "yyyy-MM"),
  );

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [incomes, setIncomes] = useState<Income[]>([]);

  const [cards, setCards] = useState<Card[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [previousBalance, setPreviousBalance] = useState<number>(0);

  const [previousCardBalances, setPreviousCardBalances] = useState<
    Record<string, number>
  >({});

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        expensesData,
        incomesData,
        cardsData,
        allPrevExpenses,
        allPrevIncomes,
      ] = await Promise.all([
        getExpensesByMonth(monthYear),

        getIncomesByMonth(monthYear),

        getCardsService(),

        getExpensesBeforeMonth(monthYear),

        getIncomesBeforeMonth(monthYear),
      ]);

      setExpenses(expensesData);

      setIncomes(incomesData);

      setCards(cardsData);

      // Cartões com saldo próprio (todos os meses anteriores)

      const prevCardNames = new Set<string>();

      allPrevIncomes.forEach((i) => {
        if (i.card) prevCardNames.add(i.card);
      });

      // Saldo geral acumulado de todos os meses anteriores (exclui cartões separados)

      const prevTotalIncomes = allPrevIncomes
        .filter((i) => !i.card)
        .reduce((s, i) => s + i.value, 0);

      const prevTotalExpenses = allPrevExpenses
        .filter((e) => !prevCardNames.has(e.card))
        .reduce((s, e) => s + e.value, 0);

      setPreviousBalance(prevTotalIncomes - prevTotalExpenses);

      // Saldo acumulado por cartão separado (VR/VA) de todos os meses anteriores

      const prevCardBal: Record<string, number> = {};

      prevCardNames.forEach((cardName) => {
        const cardIncome = allPrevIncomes
          .filter((i) => i.card === cardName)
          .reduce((s, i) => s + i.value, 0);

        const cardExpense = allPrevExpenses
          .filter((e) => e.card === cardName)
          .reduce((s, e) => s + e.value, 0);

        const bal = cardIncome - cardExpense;

        if (bal !== 0) prevCardBal[cardName] = bal;
      });

      setPreviousCardBalances(prevCardBal);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [monthYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cartões com saldo próprio (que têm entradas vinculadas, ex: VR/VA)

  const cardSeparateNames = useMemo(() => {
    const names = new Set<string>();

    incomes.forEach((i) => {
      if (i.card) names.add(i.card);
    });

    return names;
  }, [incomes]);

  const totalExpenses = useMemo(
    () =>
      expenses

        .filter((e) => !cardSeparateNames.has(e.card))

        .reduce((sum, e) => sum + e.value, 0),

    [expenses, cardSeparateNames],
  );

  const totalIncomes = useMemo(
    () =>
      incomes

        .filter((i) => !i.card)

        .reduce((sum, i) => sum + i.value, 0),

    [incomes],
  );

  const balance = useMemo(
    () => totalIncomes - totalExpenses,

    [totalIncomes, totalExpenses],
  );

  const totalBalance = useMemo(
    () => previousBalance + balance,

    [previousBalance, balance],
  );

  const expensesByType = useMemo<ExpensesByType>(() => {
    const grouped: ExpensesByType = {
      fixo: [],

      parcelado: [],

      geral: [],

      guardado: [],
    };

    expenses.forEach((expense) => {
      if (grouped[expense.type]) {
        grouped[expense.type].push(expense);
      }
    });

    const sortByDate = (a: Expense, b: Expense) => a.date.localeCompare(b.date);

    grouped.fixo.sort(sortByDate);

    grouped.parcelado.sort(sortByDate);

    grouped.geral.sort(sortByDate);

    grouped.guardado.sort(sortByDate);

    return grouped;
  }, [expenses]);

  const expensesByCard = useMemo<ExpensesByCard>(() => {
    const grouped: ExpensesByCard = {};

    expenses.forEach((expense) => {
      if (!grouped[expense.card]) {
        grouped[expense.card] = [];
      }

      grouped[expense.card].push(expense);
    });

    return grouped;
  }, [expenses]);

  const incomesByCard = useMemo<IncomesByCard>(() => {
    const grouped: IncomesByCard = {};

    incomes.forEach((income) => {
      if (income.card) {
        if (!grouped[income.card]) {
          grouped[income.card] = [];
        }

        grouped[income.card].push(income);
      }
    });

    return grouped;
  }, [incomes]);

  const expensesByCategory = useMemo<ExpensesByCategory>(() => {
    const grouped: ExpensesByCategory = {};

    expenses.forEach((expense) => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = {
          expenses: [],

          total: 0,

          color: CATEGORY_COLORS[expense.category as Category] || "#8B8B8B",
        };
      }

      grouped[expense.category].expenses.push(expense);

      grouped[expense.category].total += expense.value;
    });

    return grouped;
  }, [expenses]);

  const handleAddExpense = useCallback(
    async (expense: Omit<Expense, "id">) => {
      const groupId = crypto.randomUUID();

      //Crédito sempre vai para o mês seguinte (ou +2 se depois do fechamento)
      let adjustedExpense = { ...expense };
      if (expense.paymentMethod === 'credito') {
          const card = expense.card ? cards.find((c) => c.name === expense.card) : undefined;
          const purchaseDate = expense.date || format(new Date(), 'yyyy-MM-dd');
          adjustedExpense.monthYear = getCreditMonthYear(purchaseDate, card?.closingDay);
          }
      }
        // Gasto fixo: cria no mês atual + próximos 12 meses

        const baseDate = parse(adjustedExpense.monthYear, "yyyy-MM", new Date());
        const currentMonthExpense = { ...adjustedExpense.monthYear, groupId };
        const id = await addExpenseService(currentMonthExpense);

        setExpenses((prev) => [...prev, { ...currentMonthExpense, id }]);

        // Criar nos meses futuros em batch

        const futureExpenses: Omit<Expense, "id">[] = [];

        for (let i = 1; i <= FIXED_EXPENSE_MONTHS_AHEAD; i++) {
          const futureDate = addMonths(baseDate, i);

          const futureMonthYear = format(futureDate, "yyyy-MM");

          futureExpenses.push({
            ...adjustedExpense,

            groupId,

            monthYear: futureMonthYear,

            date: format(futureDate, "yyyy-MM-dd"),
          });
        }

        await addExpensesBatch(futureExpenses);
      } else if (adjustedExpense.type === "parcelado" && adjustedExpense.installmentTotal) {
        // Gasto parcelado: cria parcelas do mês ajustado até a última parcela

        const baseDate = parse(adjustedExpense.monthYear, "yyyy-MM", new Date());
        const startInstallment = adjustedExpense.installmentCurrent || 1;
        const totalInstallments = adjustedExpense.installmentTotal;

        const remainingInstallments = totalInstallments - startInstallment + 1;

        // Primeira parcela

        const currentMonthExpense = {
          ...adjustedExpense,

          groupId,

          installmentCurrent: startInstallment,
        };

        const id = await addExpenseService(currentMonthExpense);

        setExpenses((prev) => [...prev, { ...currentMonthExpense, id }]);

        // Parcelas futuras em batch

        if (remainingInstallments > 1) {
          const futureExpenses: Omit<Expense, "id">[] = [];

          for (let i = 1; i < remainingInstallments; i++) {
            const futureDate = addMonths(baseDate, i);

            const futureMonthYear = format(futureDate, "yyyy-MM");

            futureExpenses.push({
              ...adjustedExpense,

              groupId,

              monthYear: futureMonthYear,

              date: format(futureDate, "yyyy-MM-dd"),

              installmentCurrent: startInstallment + i,
            });
          }

          await addExpensesBatch(futureExpenses);
        }
      } else {
        // Gasto geral ou guardado

        const id = await addExpenseService(adjustedExpense);

        setExpenses((prev) => [...prev, { ...adjustedExpense, id }]);
      }
    },

    [cards],
  );

  const handleUpdateExpense = useCallback(
    async (id: string, data: Partial<Expense>) => {
      const expense = expenses.find((e) => e.id === id);

      await updateExpenseService(id, data);

      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...data } : e)),
      );

      // Se é fixo ou parcelado com groupId, perguntar se quer atualizar meses futuros

      if (
        expense?.groupId &&
        (expense.type === "fixo" || expense.type === "parcelado")
      ) {
        const confirmUpdate = window.confirm(
          "Deseja atualizar os meses seguintes também?",
        );

        if (confirmUpdate) {
          const nextMonth = format(
            addMonths(parse(expense.monthYear, "yyyy-MM", new Date()), 1),

            "yyyy-MM",
          );

          // Não propagar id, monthYear, date ou installmentCurrent para os futuros

          const updateData = { ...data };

          delete updateData.id;

          delete updateData.monthYear;

          delete updateData.date;

          delete updateData.installmentCurrent;

          delete updateData.paid;

          await updateExpensesByGroupIdFromMonth(
            expense.groupId,
            nextMonth,
            updateData,
          );
        }
      }
    },

    [expenses],
  );

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      // Encontrar o gasto para verificar se tem groupId

      const expense = expenses.find((e) => e.id === id);

      await deleteExpenseService(id);

      setExpenses((prev) => prev.filter((e) => e.id !== id));

      // Se é fixo ou parcelado com groupId, perguntar se quer deletar dos próximos meses

      if (
        expense?.groupId &&
        (expense.type === "fixo" || expense.type === "parcelado")
      ) {
        const nextMonth = format(
          addMonths(parse(expense.monthYear, "yyyy-MM", new Date()), 1),

          "yyyy-MM",
        );

        const confirmDelete = window.confirm(
          expense.type === "fixo"
            ? "Deseja remover este gasto fixo dos meses futuros também?"
            : "Deseja remover as parcelas restantes dos meses futuros?",
        );

        if (confirmDelete) {
          await deleteExpensesByGroupIdFromMonth(expense.groupId, nextMonth);
        }
      }
    },
    [expenses],
  );

  const handleAddIncome = useCallback(
    async (income: Omit<Income, "id">, replicateFuture = false) => {
      if (replicateFuture) {
        // Replicar nos próximos 12 meses

        const groupId = crypto.randomUUID();

        const baseDate = parse(income.monthYear, "yyyy-MM", new Date());

        // Mês atual

        const currentMonthIncome = { ...income, groupId };

        const id = await addIncomeService(currentMonthIncome);

        setIncomes((prev) => [...prev, { ...currentMonthIncome, id }]);

        // Próximos 12 meses em batch

        const futureIncomes: Omit<Income, "id">[] = [];

        for (let i = 1; i <= FIXED_EXPENSE_MONTHS_AHEAD; i++) {
          const futureDate = addMonths(baseDate, i);

          const futureMonthYear = format(futureDate, "yyyy-MM");

          futureIncomes.push({
            ...income,

            groupId,

            monthYear: futureMonthYear,

            date: format(futureDate, "yyyy-MM-dd"),
          });
        }

        await addIncomesBatch(futureIncomes);
      } else {
        // Apenas o mês atual

        const id = await addIncomeService(income);

        setIncomes((prev) => [...prev, { ...income, id }]);
      }
    },

    [],
  );

  const handleUpdateIncome = useCallback(
    async (id: string, data: Partial<Income>) => {
      const income = incomes.find((i) => i.id === id);

      // Atualiza o mês atual

      await updateIncomeService(id, data);

      setIncomes((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i)),
      );

      // Se tem groupId, perguntar se quer atualizar os meses seguintes

      if (income?.groupId) {
        const confirmUpdate = window.confirm(
          "Deseja atualizar os meses seguintes também?",
        );

        if (confirmUpdate) {
          const nextMonth = format(
            addMonths(parse(income.monthYear, "yyyy-MM", new Date()), 1),

            "yyyy-MM",
          );

          // Não propagar id, monthYear ou date para os futuros

          const { ...updateData } = data;

          delete updateData.id;

          delete updateData.monthYear;

          delete updateData.date;

          await updateIncomesByGroupIdFromMonth(
            income.groupId,
            nextMonth,
            updateData,
          );
        }
      }
    },

    [incomes],
  );

  const handleDeleteIncome = useCallback(
    async (id: string) => {
      const income = incomes.find((i) => i.id === id);

      await deleteIncomeService(id);

      setIncomes((prev) => prev.filter((i) => i.id !== id));

      // Se tem groupId, perguntar se quer remover dos meses futuros

      if (income?.groupId) {
        const confirmDelete = window.confirm(
          "Deseja remover esta entrada dos meses futuros também?",
        );

        if (confirmDelete) {
          const nextMonth = format(
            addMonths(parse(income.monthYear, "yyyy-MM", new Date()), 1),

            "yyyy-MM",
          );

          await deleteIncomesByGroupIdFromMonth(income.groupId, nextMonth);
        }
      }
    },
    [incomes],
  );

  const handleAddCard = useCallback(async (card: Omit<Card, "id">) => {
    const id = await addCardService(card);

    setCards((prev) => [...prev, { ...card, id }]);
  }, []);

  const handleDeleteCard = useCallback(async (id: string) => {
    await deleteCardService(id);

    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value: FinanceContextType = {
    monthYear,
    expenses,
    incomes,
    cards,
    loading,
    totalExpenses,
    totalIncomes,
    balance,
    previousBalance,
    totalBalance,
    previousCardBalances,
    expensesByType,
    expensesByCard,
    expensesByCategory,
    incomesByCard,
    cardSeparateNames,
    setMonthYear,
    addExpense: handleAddExpense,
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
    addIncome: handleAddIncome,
    updateIncome: handleUpdateIncome,
    deleteIncome: handleDeleteIncome,
    addCard: handleAddCard,
    deleteCard: handleDeleteCard,
    refreshData: loadData,
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);

  if (context === undefined) {
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }

  return context;
}