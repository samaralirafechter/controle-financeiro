import { useEffect, useMemo, useState } from "react";
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
    addSaving,
    updateSaving,
    deleteSaving,
    refreshData,
  } = useFinance();

  const [selectedCategory, setSelectedCategory] =
    useState<SavingsCategory | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [savingValue, setSavingValue] = useState("");
  const [savingDate, setSavingDate] = useState(
    `${monthYear}-01`,
  );
  const [savingLoading, setSavingLoading] = useState(false);
  const [savingError, setSavingError] = useState("");

  const [editingSavingId, setEditingSavingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<SavingsCategory>("Casa");
  const [actionLoading, setActionLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setSavingDate(`${monthYear}-01`);
  }, [monthYear]);

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

  const handleAddSaving = async () => {
    if (!selectedCategory) return;

    const value = Number(savingValue.replace(",", "."));

    if (!value || value <= 0) {
      setSavingError("Informe um valor válido.");
      return;
    }

    if (!savingDate) {
      setSavingError("Informe a data do depósito.");
      return;
    }

    setSavingLoading(true);
    setSavingError("");

    try {
      await addSaving(selectedCategory, value, savingDate);

      await refreshData();

      setSavingValue("");
      setSavingDate(`${monthYear}-01`);
      setShowAddForm(false);
    } catch (error) {
      console.error("Erro ao adicionar depósito:", error);
      setSavingError("Não foi possível salvar o depósito.");
    } finally {
      setSavingLoading(false);
    }
  };

  const handleStartEdit = (saving: Saving) => {
    setEditingSavingId(saving.id);
    setEditingValue(String(saving.value));
    setEditingCategory(saving.category);
    setEditError("");
    setConfirmDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingSavingId(null);
    setEditingValue("");
    setEditError("");
  };

  const handleSaveEdit = async (savingId: string) => {
    const value = Number(editingValue.replace(",", "."));

    if (!value || value <= 0) {
      setEditError("Informe um valor válido.");
      return;
    }

    setActionLoading(true);
    setEditError("");

    try {
      await updateSaving(savingId, {
        value,
        category: editingCategory,
      });

      setEditingSavingId(null);
      setEditingValue("");
    } catch (error) {
      console.error("Erro ao editar depósito:", error);
      setEditError("Não foi possível atualizar o depósito.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSaving = async (savingId: string) => {
    setActionLoading(true);

    try {
      await deleteSaving(savingId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Erro ao excluir depósito:", error);
      setEditError("Não foi possível excluir o depósito.");
    } finally {
      setActionLoading(false);
    }
  };

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

          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setSavingError("");
            }}
            style={styles.addButton}
          >
            + Adicionar depósito
          </button>

          {showAddForm && (
            <div style={styles.addForm}>
              <h4 style={styles.formTitle}>Novo depósito</h4>

              <label style={styles.formLabel}>
                Valor (R$)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ex.: 100,00"
                  value={savingValue}
                  onChange={(e) => setSavingValue(e.target.value)}
                  style={styles.formInput}
                />
              </label>

              <label style={styles.formLabel}>
                Data do depósito
                <input
                  type="date"
                  value={savingDate}
                  onChange={(e) => setSavingDate(e.target.value)}
                  style={styles.formInput}
                />
              </label>

              {savingError && (
                <p style={styles.formError}>{savingError}</p>
              )}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={styles.cancelButton}
                  disabled={savingLoading}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleAddSaving}
                  style={styles.saveButton}
                  disabled={savingLoading}
                >
                  {savingLoading ? "Salvando..." : "Salvar depósito"}
                </button>
              </div>
            </div>
          )}

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
                <div style={styles.historyInfo}>
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

                {editingSavingId === saving.id ? (
                  <div style={styles.editForm}>
                    <label style={styles.formLabel}>
                      Novo valor (R$)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        style={styles.formInput}
                      />
                    </label>

                    <label style={styles.formLabel}>
                      Cofrinho
                      <select
                        value={editingCategory}
                        onChange={(e) =>
                          setEditingCategory(e.target.value as SavingsCategory)
                        }
                        style={styles.formInput}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {editError && (
                      <p style={styles.formError}>{editError}</p>
                    )}

                    <div style={styles.formActions}>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={styles.cancelButton}
                        disabled={actionLoading}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveEdit(saving.id)}
                        style={styles.saveButton}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                ) : confirmDeleteId === saving.id ? (
                  <div style={styles.deleteConfirmation}>
                    <span>Deseja excluir este depósito?</span>

                    <div style={styles.formActions}>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        style={styles.cancelButton}
                        disabled={actionLoading}
                      >
                        Não
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSaving(saving.id)}
                        style={styles.deleteButton}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Excluindo..." : "Sim, excluir"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.historyActions}>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(saving)}
                      style={styles.editButton}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDeleteId(saving.id);
                        setEditError("");
                      }}
                      style={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                )}
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
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
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
    addButton: {
      border: "none",
      background: "#059669",
      color: "#FFFFFF",
      borderRadius: 8,
      padding: "9px 13px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 12,
    },
    addForm: {
      background: "#F9FAFB",
      border: "1px solid #D1FAE5",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    formTitle: {
      margin: 0,
      fontSize: 16,
      color: "#111827",
    },
    formLabel: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
    },
    formInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: 11,
      border: "1px solid #D1D5DB",
      borderRadius: 8,
      fontSize: 14,
    },
    formError: {
      color: "#DC2626",
      fontSize: 12,
      margin: 0,
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
    },
    cancelButton: {
      border: "1px solid #D1D5DB",
      background: "#FFFFFF",
      borderRadius: 8,
      padding: "10px 14px",
      cursor: "pointer",
    },
    saveButton: {
      border: "none",
      background: "#059669",
      color: "#FFFFFF",
      borderRadius: 8,
      padding: "10px 14px",
      cursor: "pointer",
      fontWeight: 700,
    },
  historyInfo: {
    display: "flex",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  historyActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
  },
  editButton: {
    border: "1px solid #D1D5DB",
    background: "#FFFFFF",
    color: "#374151",
    borderRadius: 7,
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
  deleteButton: {
    border: "none",
    background: "#FEE2E2",
    color: "#B91C1C",
    borderRadius: 7,
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
  editForm: {
    width: "100%",
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  deleteConfirmation: {
    width: "100%",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    fontSize: 13,
    color: "#991B1B",
  },
};
