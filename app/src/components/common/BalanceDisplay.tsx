import { useMemo } from "react";
import { useFinance } from "../../contexts/FinanceContext";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function BalanceDisplay() {
  const {
    totalIncomes,
    totalExpenses,
    balance,
    previousBalance,
    totalBalance,

    incomesByCard,
    expensesByCard,
    cardSeparateNames,
    previousCardBalances,
  } = useFinance();

  const isTotalPositive = totalBalance >= 0;

  // Saldos dos cartões com balanço separado (VR, VA, etc.) + saldo mês anterior

  const cardBalances = useMemo(() => {
    const entries: {
      name: string;
      monthBalance: number;
      prevBalance: number;
      total: number;
    }[] = [];

    cardSeparateNames.forEach((name) => {
      const income = (incomesByCard[name] ?? []).reduce(
        (s, i) => s + i.value,
        0,
      );

      const expense = (expensesByCard[name] ?? []).reduce(
        (s, e) => s + e.value,
        0,
      );

      const monthBalance = income - expense;

      const prevBalance = previousCardBalances[name] ?? 0;

      entries.push({
        name,
        monthBalance,
        prevBalance,
        total: monthBalance + prevBalance,
      });
    });

    return entries;
  }, [cardSeparateNames, incomesByCard, expensesByCard, previousCardBalances]);

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={{ ...styles.card, borderTop: "4px solid #10B981" }}>
          <span style={styles.label}>Total Entradas</span>

          <span style={{ ...styles.value, color: "#10B981" }}>
            {fmt(totalIncomes)}
          </span>
        </div>

        <div style={{ ...styles.card, borderTop: "4px solid #EF4444" }}>
          <span style={styles.label}>Total Gastos</span>

          <span style={{ ...styles.value, color: "#EF4444" }}>
            {fmt(totalExpenses)}
          </span>
        </div>

        <div
          style={{
            ...styles.card,
            borderTop: `4px solid ${isTotalPositive ? "#10B981" : "#EF4444"}`,
          }}
        >
          <span style={styles.label}>Saldo Geral</span>

          <span
            style={{
              ...styles.value,
              fontSize: 30,
              color: isTotalPositive ? "#10B981" : "#EF4444",
            }}
          >
            {fmt(totalBalance)}
          </span>

          {previousBalance !== 0 && (
            <span style={styles.detail}>
              Mês: {fmt(balance)} + Anterior: {fmt(previousBalance)}
            </span>
          )}
        </div>
      </div>

      {cardBalances.length > 0 && (
        <div style={{ ...styles.row, marginTop: 12 }}>
          {cardBalances.map((cb) => (
            <div
              key={cb.name}
              style={{
                ...styles.cardSmall,
                borderTop: `4px solid ${cb.total >= 0 ? "#F59E0B" : "#EF4444"}`,
              }}
            >
              <span style={styles.label}>Saldo {cb.name}</span>

              <span
                style={{
                  ...styles.value,
                  fontSize: 20,
                  color: cb.total >= 0 ? "#F59E0B" : "#EF4444",
                }}
              >
                {fmt(cb.total)}
              </span>

              {cb.prevBalance !== 0 && (
                <span style={styles.detail}>
                  Mês: {fmt(cb.monthBalance)} + Anterior: {fmt(cb.prevBalance)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "0 16px 16px",
  },

  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },

  card: {
    flex: "1 1 200px",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  cardSmall: {
    flex: "1 1 140px",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "14px 18px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  value: {
    fontSize: 26,
    fontWeight: 700,
  },

  detail: {
    fontSize: 11,
    color: "#9CA3AF",
  },
};
