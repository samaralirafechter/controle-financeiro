import { useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import MonthSelector from "../components/common/MonthSelector";
import BalanceDisplay from "../components/common/BalanceDisplay";
import ExpenseSummary from "../components/expenses/ExpenseSummary";
import IncomeSection from "../components/income/IncomeSection";
import CardSummary from "../components/cards/CardSummary";
import ChartSection from "../components/charts/ChartSection";

type Tab = "gastos" | "entradas" | "graficos";

export default function Dashboard() {
  const { loading } = useFinance();
  const [activeTab, setActiveTab] = useState<Tab>("gastos");
  const tabs: { key: Tab; label: string }[] = [
    { key: "gastos", label: "Gastos" },
    { key: "entradas", label: "Financeiro" },
    { key: "graficos", label: "Gráficos" },
  ];

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "12px 8px",
    border: "none",
    borderRadius: 10,
    background: active ? "#2563EB" : "transparent",
    color: active ? "#FFFFFF" : "#6B7280",
    fontWeight: active ? 700 : 500,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner} />

          <span style={{ color: "#6B7280", fontSize: 14 }}>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <MonthSelector />
      <BalanceDisplay />
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            style={tabBtnStyle(activeTab === tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "gastos" && <ExpenseSummary />}
        {activeTab === "entradas" && (
          <>
            <IncomeSection />
            <div style={{ marginTop: 16 }}>
              <CardSummary />
            </div>
          </>
        )}

        {activeTab === "graficos" && <ChartSection />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#F3F4F6",
    paddingBottom: 80,
  },

  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    flexDirection: "column",
    gap: 12,
  },

  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #E5E7EB",
    borderTopColor: "#2563EB",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  tabBar: {
    display: "flex",
    background: "#FFFFFF",
    borderRadius: 12,
    margin: "0 16px 16px",
    padding: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  content: {
    padding: "0 16px 16px",
  },
};
