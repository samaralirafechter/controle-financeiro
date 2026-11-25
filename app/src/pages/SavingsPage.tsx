
import { useMemo, useState } from "react";
import { useFinance } from "../contexts/FinanceContext";
import type { Saving, SavingsCategory } from "../types";

const CATEGORIES: {
  name: SavingsCategory;
  icon: string;
  color: string;
  background: string;
}[] = [
  {
    name: "Casa",
    icon: "🏠",
    color: "#2563EB",
    background: "#DBEAFE",
  },
  {
    name: "Carro",
    icon: "🚗",
    color: "#7C3AED",
    background: "#EDE9FE",
  },
  {
    name: "Viagens",
    icon: "✈️",
    color: "#0891B2",
    background: "#CFFAFE",
  },
  {
    name: "Emergência",
    icon: "🛡️",
    color: "#059669",
    background: "#D1FAE5",
  },
];

const fmt = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");

export default function SavingsPage() {
  const {
    monthYear,
    savings,
    previousSavings,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] =
    useState<SavingsCategory | null>(null);

  const allSavings = useMemo(
    () => [...previousSavings, ...savings],
    [previousSavings, savings],
  );

  const totalAccumulated = allSavings.reduce(
    (sum, saving) => sum + saving.value,
    0,
  );

  const selectedMonthTotal = savings.reduce(
    (sum, saving) => sum + saving.value,
    0,
  );

  const getCategoryTotal = (category: SavingsCategory) =>
    allSavings
      .filter((saving) => saving.category === category)
      .reduce((sum, saving) => sum + saving.value, 0);

  const getCategoryMonthTotal = (category: SavingsCategory) =>
    savings
      .filter((saving) => saving.category === category)
      .reduce((sum, saving) => sum + saving.value, 0);

  const selectedInfo = CATEGORIES.find(
    (category) => category.name === selectedCategory,
  );

  const categoryHistory = selectedCategory
    ? allSavings
        .filter((saving) => saving.category === selectedCategory)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  const monthLabel = new Date(
    `${monthYear}-01T12:00:00`,
  ).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Meu Cofrinho 🐷</h2>
          <p style={styles.subtitle}>
            Seus objetivos e conquistas financeiras
          </p>
        </div>
      </div>

      <div style={styles.totalCard}>
        <span style={styles.totalCaption}>
          Total acumulado nos cofrinhos
        </span>
        <strong style={styles.totalValue}>
          {fmt(totalAccumulated)}
        </strong>
        <div style={styles.totalFooter}>
          <span>Guardado em {monthLabel}</span>
          <strong>{fmt(selectedMonthTotal)}</strong>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Meus objetivos</h3>

      <div style={styles.grid}>
        {CATEGORIES.map((category) => {
          const accumulated = getCategoryTotal(category.name);
          const monthTotal = getCategoryMonthTotal(category.name);

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              style={styles.categoryCard}
            >
              <div
                style={{
                  ...styles.categoryIcon,
                  background: category.background,
                }}
              >
                {category.icon}
              </div>

              <div style={styles.categoryName}>
                {category.name}
              </div>

              <strong style={styles.categoryValue}>
                {fmt(accumulated)}
              </strong>

              <span style={styles.categoryCaption}>
                Acumulado
              </span>

              <div style={styles.categoryMonth}>
                Neste mês: {fmt(monthTotal)}
              </div>

              <span
                style={{
                  ...styles.viewDetails,
                  color: category.color,
                }}
              >
                Ver detalhes →
              </span>
            </button>
          );
        })}
      </div>

      {selectedCategory && selectedInfo && (
        <div style={styles.details}>
          <div style={styles.detailsHeader}>
            <div>
              <h3 style={styles.detailsTitle}>
                {selectedInfo.icon} {selectedCategory}
              </h3>
              <span style={styles.subtitle}>
                Histórico de depósitos
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              style={styles.closeButton}
            >
              Fechar ✕
            </button>
          </div>

          <div style={styles.detailsTotal}>
            <span>Total acumulado</span>
            <strong>{fmt(getCategoryTotal(selectedCategory))}</strong>
          </div>

          <div style={styles.historyHeader}>
            Depósitos realizados
          </div>

          {categoryHistory.length === 0 ? (
            <p style={styles.empty}>
              Nenhum depósito registrado neste cofrinho ainda.
            </p>
          ) : (
            categoryHistory.map((saving: Saving) => (
              <div key={saving.id} style={styles.historyItem}>
                <div>
                  <strong>{fmt(saving.value)}</strong>
                  <span style={styles.historyDate}>
                    {formatDate(saving.date)}
                  </span>
                </div>
                <span style={styles.historyMonth}>
                  {saving.monthYear}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
  },
  totalCard: {
    background: "linear-gradient(135deg, #059669, #047857)",
    borderRadius: 16,
    padding: 22,
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxShadow: "0 4px 12px rgba(5,150,105,0.2)",
  },
  totalCaption: {
    fontSize: 13,
    opacity: 0.9,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: 800,
  },
  totalFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255,255,255,0.25)",
    paddingTop: 12,
    marginTop: 8,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  categoryCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: 16,
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 23,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },
  categoryValue: {
    fontSize: 19,
    color: "#059669",
    fontWeight: 800,
  },
  categoryCaption: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  categoryMonth: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 5,
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 5,
  },
  details: {
    background: "#FFFFFF",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    padding: 18,
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    margin: 0,
    color: "#111827",
  },
  closeButton: {
    border: "none",
    background: "#F3F4F6",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    color: "#374151",
  },
  detailsTotal: {
    background: "#ECFDF5",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#047857",
  },
  historyHeader: {
    fontWeight: 700,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
    color: "#111827",
  },
  empty: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    padding: 20,
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #F3F4F6",
  },
  historyDate: {
    display: "block",
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
  historyMonth: {
    fontSize: 11,
    color: "#6B7280",
  },
};
