import type { Expense, Income, Card } from "../types";

const KEYS = {
  expenses: "cf_expenses",

  incomes: "cf_incomes",

  cards: "cf_cards",
};

function getAll<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return crypto.randomUUID();
}

// ==================== EXPENSES ====================

export async function addExpense(
  expense: Omit<Expense, "id">,
): Promise<string> {
  const id = generateId();

  const all = getAll<Expense>(KEYS.expenses);

  all.push({ ...expense, id });

  saveAll(KEYS.expenses, all);

  return id;
}

export async function addExpensesBatch(
  expenses: Omit<Expense, "id">[],
): Promise<void> {
  const all = getAll<Expense>(KEYS.expenses);

  for (const expense of expenses) {
    all.push({ ...expense, id: generateId() });
  }

  saveAll(KEYS.expenses, all);
}

export async function updateExpense(
  id: string,
  expense: Partial<Expense>,
): Promise<void> {
  const all = getAll<Expense>(KEYS.expenses);

  const index = all.findIndex((e) => e.id === id);

  if (index !== -1) {
    all[index] = { ...all[index], ...expense };

    saveAll(KEYS.expenses, all);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const all = getAll<Expense>(KEYS.expenses);

  saveAll(
    KEYS.expenses,
    all.filter((e) => e.id !== id),
  );
}

export async function deleteExpensesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,
): Promise<number> {
  const all = getAll<Expense>(KEYS.expenses);

  const before = all.length;

  const filtered = all.filter(
    (e) => !(e.groupId === groupId && e.monthYear >= fromMonthYear),
  );

  saveAll(KEYS.expenses, filtered);

  return before - filtered.length;
}

export async function getExpensesByMonth(
  monthYear: string,
): Promise<Expense[]> {
  const all = getAll<Expense>(KEYS.expenses);

  return all.filter((e) => e.monthYear === monthYear);
}

// ==================== INCOMES ====================

export async function addIncome(income: Omit<Income, "id">): Promise<string> {
  const id = generateId();

  const all = getAll<Income>(KEYS.incomes);

  all.push({ ...income, id });

  saveAll(KEYS.incomes, all);

  return id;
}

export async function addIncomesBatch(
  incomes: Omit<Income, "id">[],
): Promise<void> {
  const all = getAll<Income>(KEYS.incomes);

  for (const income of incomes) {
    all.push({ ...income, id: generateId() });
  }

  saveAll(KEYS.incomes, all);
}

export async function updateIncome(
  id: string,
  income: Partial<Income>,
): Promise<void> {
  const all = getAll<Income>(KEYS.incomes);

  const index = all.findIndex((i) => i.id === id);

  if (index !== -1) {
    all[index] = { ...all[index], ...income };

    saveAll(KEYS.incomes, all);
  }
}

export async function updateIncomesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,

  data: Partial<Income>,
): Promise<number> {
  const all = getAll<Income>(KEYS.incomes);

  let count = 0;

  for (let i = 0; i < all.length; i++) {
    if (all[i].groupId === groupId && all[i].monthYear >= fromMonthYear) {
      all[i] = { ...all[i], ...data };

      count++;
    }
  }

  if (count > 0) {
    saveAll(KEYS.incomes, all);
  }

  return count;
}

export async function deleteIncome(id: string): Promise<void> {
  const all = getAll<Income>(KEYS.incomes);

  saveAll(
    KEYS.incomes,
    all.filter((i) => i.id !== id),
  );
}

export async function deleteIncomesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,
): Promise<number> {
  const all = getAll<Income>(KEYS.incomes);

  const before = all.length;

  const filtered = all.filter(
    (i) => !(i.groupId === groupId && i.monthYear >= fromMonthYear),
  );

  saveAll(KEYS.incomes, filtered);

  return before - filtered.length;
}

export async function getIncomesByMonth(monthYear: string): Promise<Income[]> {
  const all = getAll<Income>(KEYS.incomes);

  return all.filter((i) => i.monthYear === monthYear);
}

// ==================== CARDS ====================

export async function addCard(card: Omit<Card, "id">): Promise<string> {
  const id = generateId();

  const all = getAll<Card>(KEYS.cards);

  all.push({ ...card, id });

  saveAll(KEYS.cards, all);

  return id;
}

export async function getCards(): Promise<Card[]> {
  return getAll<Card>(KEYS.cards);
}

export async function deleteCard(id: string): Promise<void> {
  const all = getAll<Card>(KEYS.cards);

  saveAll(
    KEYS.cards,
    all.filter((c) => c.id !== id),
  );
}