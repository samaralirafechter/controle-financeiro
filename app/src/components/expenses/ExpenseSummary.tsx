import { useFinance } from "../../contexts/FinanceContext";
import type { ExpenseType } from "../../types";
import { EXPENSE_TYPE_LABELS } from "../../types";
import ExpenseTable from "./ExpenseTable";

const TYPES: ExpenseType[] = ["fixo", "parcelado", "geral"];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

export default function ExpenseSummary() {
  const { totalExpenses } = useFinance();

  return (
    <div>
      {TYPES.map((t) => (
        <ExpenseTable
          key={t}
          type={t}
          title={EXPENSE_TYPE_LABELS[t]}
        />
      ))}

      <div style={styles.totalBar}>
        <span style={styles.totalLabel}>Total de Gastos</span>
        <span style={styles.totalValue}>{fmt(totalExpenses)}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  totalBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "16px 24px",
    marginTop: 4,
    borderTop: "4px solid #EF4444",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#EF4444",
  },
};