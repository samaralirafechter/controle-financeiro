import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

import type { Expense, Income, Card, Saving } from "../types";

// ==================== EXPENSES ====================

export async function addExpense(
  expense: Omit<Expense, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "expenses"), expense);

  return docRef.id;
}

/**

 * Adiciona múltiplos gastos de uma vez (batch write).

 * Usado para criar gastos fixos nos próximos meses ou parcelas futuras.

 */

export async function addExpensesBatch(
  expenses: Omit<Expense, "id">[],
): Promise<void> {
  const batch = writeBatch(db);

  const colRef = collection(db, "expenses");

  for (const expense of expenses) {
    const docRef = doc(colRef);

    batch.set(docRef, expense);
  }

  await batch.commit();
}

/**

 * Deleta todos os gastos futuros com o mesmo groupId (a partir de um mês específico).

 */

export async function deleteExpensesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,
): Promise<number> {
  const q = query(
    collection(db, "expenses"),

    where("groupId", "==", groupId),
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  let count = 0;

  snapshot.docs.forEach((d) => {
    const data = d.data();

    if (data.monthYear >= fromMonthYear) {
      batch.delete(d.ref);

      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

export async function updateExpense(
  id: string,
  expense: Partial<Expense>,
): Promise<void> {
  const docRef = doc(db, "expenses", id);

  await updateDoc(docRef, expense);
}

/**

 * Atualiza todos os gastos futuros com o mesmo groupId (a partir de um mês específico).

 */

export async function updateExpensesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,

  data: Partial<Expense>,
): Promise<number> {
  const q = query(
    collection(db, "expenses"),

    where("groupId", "==", groupId),
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  let count = 0;

  snapshot.docs.forEach((d) => {
    const docData = d.data();

    if (docData.monthYear >= fromMonthYear) {
      batch.update(d.ref, data);

      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

export async function deleteExpense(id: string): Promise<void> {
  const docRef = doc(db, "expenses", id);

  await deleteDoc(docRef);
}

export async function getExpensesByMonth(
  monthYear: string,
): Promise<Expense[]> {
  const q = query(
    collection(db, "expenses"),

    where("monthYear", "==", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,

    ...d.data(),
  })) as Expense[];
}

export async function getExpensesBeforeMonth(
  monthYear: string,
): Promise<Expense[]> {
  const q = query(
    collection(db, "expenses"),

    where("monthYear", "<", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,

    ...d.data(),
  })) as Expense[];
}

// ==================== INCOMES ====================

export async function addIncome(income: Omit<Income, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "incomes"), income);

  return docRef.id;
}

/**

 * Adiciona múltiplas entradas de uma vez (batch write).

 * Usado para replicar entradas fixas (salário, adiantamento) nos próximos meses.

 */

export async function addIncomesBatch(
  incomes: Omit<Income, "id">[],
): Promise<void> {
  const batch = writeBatch(db);

  const colRef = collection(db, "incomes");

  for (const income of incomes) {
    const docRef = doc(colRef);

    batch.set(docRef, income);
  }

  await batch.commit();
}

export async function updateIncome(
  id: string,
  income: Partial<Income>,
): Promise<void> {
  const docRef = doc(db, "incomes", id);

  await updateDoc(docRef, income);
}

/**

 * Atualiza todas as entradas futuras com o mesmo groupId (a partir de um mês específico).

 */

export async function updateIncomesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,

  data: Partial<Income>,
): Promise<number> {
  const q = query(
    collection(db, "incomes"),

    where("groupId", "==", groupId),
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  let count = 0;

  snapshot.docs.forEach((d) => {
    const docData = d.data();

    if (docData.monthYear >= fromMonthYear) {
      batch.update(d.ref, data);

      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

export async function deleteIncome(id: string): Promise<void> {
  const docRef = doc(db, "incomes", id);

  await deleteDoc(docRef);
}

/**

 * Deleta todas as entradas futuras com o mesmo groupId (a partir de um mês específico).

 */

export async function deleteIncomesByGroupIdFromMonth(
  groupId: string,

  fromMonthYear: string,
): Promise<number> {
  const q = query(
    collection(db, "incomes"),

    where("groupId", "==", groupId),
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  let count = 0;

  snapshot.docs.forEach((d) => {
    const docData = d.data();

    if (docData.monthYear >= fromMonthYear) {
      batch.delete(d.ref);

      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

export async function getIncomesByMonth(monthYear: string): Promise<Income[]> {
  const q = query(
    collection(db, "incomes"),

    where("monthYear", "==", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,

    ...d.data(),
  })) as Income[];
}

export async function getIncomesBeforeMonth(
  monthYear: string,
): Promise<Income[]> {
  const q = query(
    collection(db, "incomes"),

    where("monthYear", "<", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,

    ...d.data(),
  })) as Income[];
}

// ==================== BALANCE ====================

/**

 * Calcula o saldo (entradas - gastos) de um mês específico.

 */

export async function getBalanceByMonth(monthYear: string): Promise<number> {
  const [expenses, incomes] = await Promise.all([
    getExpensesByMonth(monthYear),

    getIncomesByMonth(monthYear),
  ]);

  const totalIncomes = incomes.reduce((sum, i) => sum + i.value, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);

  return totalIncomes - totalExpenses;
}

// ==================== CARDS ====================

export async function addCard(card: Omit<Card, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "cards"), card);

  return docRef.id;
}

export async function getCards(): Promise<Card[]> {
  const snapshot = await getDocs(collection(db, "cards"));

  return snapshot.docs.map((d) => ({
    id: d.id,

    ...d.data(),
  })) as Card[];
}

export async function updateCard(
  id: string,
  data: Partial<Card>,
): Promise<void> {
  const docRef = doc(db, "cards", id);

  // Substituir undefined por deleteField() para remover campos opcionais do Firestore

  const cleanData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "id") continue;

    cleanData[key] = value === undefined ? deleteField() : value;
  }

  await updateDoc(docRef, cleanData);
}

export async function deleteCard(id: string): Promise<void> {
  const docRef = doc(db, "cards", id);

  await deleteDoc(docRef);
}

// ==================== SAVINGS / COFRINHO ====================

// Adiciona um depósito ao Cofrinho
export async function addSaving(
  saving: Omit<Saving, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, "savings"), saving);

  return docRef.id;
}

// Busca os depósitos de um mês específico
export async function getSavingsByMonth(
  monthYear: string,
): Promise<Saving[]> {
  const q = query(
    collection(db, "savings"),
    where("monthYear", "==", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Saving[];
}

// Busca todos os depósitos anteriores a um mês
export async function getSavingsBeforeMonth(
  monthYear: string,
): Promise<Saving[]> {
  const q = query(
    collection(db, "savings"),
    where("monthYear", "<", monthYear),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Saving[];
}

// Exclui um depósito
export async function deleteSaving(id: string): Promise<void> {
  const docRef = doc(db, "savings", id);

  await deleteDoc(docRef);
}

// Atualiza um depósito específico do Cofrinho
export async function updateSaving(
  id: string,
  data: Partial<Saving>,
): Promise<void> {
  const docRef = doc(db, "savings", id);

  await updateDoc(docRef, data);
}
