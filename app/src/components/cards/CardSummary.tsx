import { useState } from "react";
import { Trash2, Plus, CreditCard, Banknote } from "lucide-react";
import { useFinance } from "../../contexts/FinanceContext";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function CardSummary() {
  const {
    cards,
    expensesByCard,
    incomesByCard,
    totalExpenses,
    addCard,
    deleteCard,
    updateExpense,
  } = useFinance();

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardOwner, setCardOwner] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [cardClosingDay, setCardClosingDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingInvoice, setTogglingInvoice] = useState<string | null>(null);

  async function handleAddCard() {
    if (!cardName.trim()) return;
    setSaving(true);

    try {
      const dueDay = cardDueDay ? parseInt(cardDueDay, 10) : undefined;
      const closingDay = cardClosingDay ? parseInt(cardClosingDay, 10) : undefined;

      await addCard({
        name: cardName.trim(),
        owner: cardOwner.trim(),

        ...(dueDay && dueDay >= 1 && dueDay <= 31 ? { dueDay } : {}),
        ...(closingDay && closingDay >= 1 && closingDay <= 31 ? { closingDay } : {}),
      });
      setCardName("");
      setCardOwner("");
      setCardDueDay("");
      setCardClosingDay("");
      setShowAddCard(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard(id: string, name: string) {
    if (window.confirm(`Tem certeza que deseja excluir o cartão "${name}"?`)) {
      await deleteCard(id);
    }
  }

  async function handleToggleInvoicePaid(
    cardName: string,
    creditExpenses: typeof expenses,
  ) {
    if (togglingInvoice) return;

    setTogglingInvoice(cardName);

    try {
      const allPaid = creditExpenses.every((e) => e.paid);
      const newPaid = !allPaid;
      await Promise.all(
        creditExpenses.map((e) => updateExpense(e.id, { paid: newPaid })),
      );
    } finally {
      setTogglingInvoice(null);
    }
  }

  const expenses = useFinance().expenses;

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h3 style={styles.heading}>Cartões</h3>

        <button
          style={styles.addCardBtn}
          onClick={() => setShowAddCard(!showAddCard)}
        >
          <Plus size={16} /> Novo Cartão
        </button>
      </div>

      {showAddCard && (
        <div style={styles.addCardForm}>
          <input
            style={styles.input}
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Nome do cartão (ex: Nubank, Ticket VR)"
          />

          <input
            style={styles.input}
            value={cardOwner}
            onChange={(e) => setCardOwner(e.target.value)}
            placeholder="Dono - opcional (ex: Samuel, Lucas)"
          />

          <input
            style={styles.input}
            type="number"
            min="1"
            max="31"
            value={cardDueDay}
            onChange={(e) => setCardDueDay(e.target.value)}
            placeholder="Dia vencimento fatura - opcional (ex: 10)"
          />
          <input
            style={styles.input}
            type="number"
            min="1"
            max="31"
            value={cardClosingDay}
            onChange={(e) => setCardClosingDay(e.target.value)}
            placeholder="Dia de fechamento da fatura - opcional (ex: 25)"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={styles.confirmBtn}
              onClick={handleAddCard}
              disabled={saving || !cardName.trim()}
            >
              {saving ? "Salvando..." : "Adicionar"}
            </button>

            <button
              style={styles.cancelBtn}

              onClick={() => {
                setShowAddCard(false);
                setCardName("");
                setCardOwner("");
                setCardDueDay("");
                setCardClosingDay("");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {cards

          .filter((card) => {
            const hasExpenses = (expensesByCard[card.name] ?? []).length > 0;
            const hasIncome = (incomesByCard[card.name] ?? []).length > 0;
            return hasExpenses || hasIncome;
          })

          .map((card) => {
            const items = expensesByCard[card.name] ?? [];

            const creditItems = items.filter(
              (e) => e.paymentMethod === "credito" || !e.paymentMethod,
            );

            const debitItems = items.filter(
              (e) => e.paymentMethod === "debito",
            );

            const subtotal = items.reduce((sum, e) => sum + e.value, 0);
            const creditTotal = creditItems.reduce(
              (sum, e) => sum + e.value,
              0,
            );

            const debitTotal = debitItems.reduce((sum, e) => sum + e.value, 0);
            const cardIncomes = incomesByCard[card.name] ?? [];
            const totalCardIncome = cardIncomes.reduce(
              (sum, i) => sum + i.value,
              0,
            );

            const hasCardIncome = totalCardIncome > 0;
            const cardBalance = totalCardIncome - subtotal;
            const invoicePaid =
              creditItems.length > 0 && creditItems.every((e) => e.paid);

            return (
              <div key={card.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cardName}>{card.name}</span>

                    {card.owner && (
                      <span style={styles.cardOwner}> - {card.owner}</span>
                    )}
                  </div>

                  <button
                    style={styles.deleteCardBtn}

                    onClick={() => handleDeleteCard(card.id, card.name)}

                    title="Excluir cartão"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {hasCardIncome && (
                  <div style={styles.cardIncomeRow}>
                    <span style={styles.cardIncomeLabel}>Crédito recebido</span>

                    <span style={styles.cardIncomeValue}>
                      {fmt(totalCardIncome)}
                    </span>
                  </div>
                )}

                {/* ===== FATURA DE CRÉDITO ===== */}

                {creditItems.length > 0 && (
                  <div style={styles.sectionRow}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CreditCard size={14} color="#7C3AED" />

                      <span style={styles.sectionTitle}>Fatura de Crédito</span>

                      {card.closingDay && (
                        <span style={styles.dueBadge}>
                          Vence dia {card.closingDay}
                        </span>
                      )}
                  {card.dueDay && (
                        <span style={styles.dueBadge}>
                          Vence dia {card.dueDay}
                        </span>
                      )}

                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: invoicePaid ? "#9CA3AF" : "#7C3AED",
                          textDecoration: invoicePaid ? "line-through" : "none",
                        }}
                      >
                        {fmt(creditTotal)}
                      </span>

                      <label style={styles.invoiceCheckLabel}>
                        <input
                          type="checkbox"

                          checked={invoicePaid}

                          onChange={() =>
                            handleToggleInvoicePaid(card.name, creditItems)
                          }

                          disabled={togglingInvoice === card.name}

                          style={{
                            width: 18,
                            height: 18,
                            accentColor: "#10B981",
                            cursor: "pointer",
                          }}
                        />

                        <span
                          style={{ color: invoicePaid ? "#10B981" : "#6B7280" }}
                        >
                          {invoicePaid ? "Paga" : "Pagar"}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* ===== DÉBITO ===== */}

                {debitItems.length > 0 && (
                  <div style={styles.sectionRow}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Banknote size={14} color="#2563EB" />

                      <span
                        style={{ ...styles.sectionTitle, color: "#2563EB" }}
                      >
                        Débito
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#2563EB",
                      }}
                    >
                      {fmt(debitTotal)}
                    </span>
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <span style={styles.subtotalLabel}>Total Gastos</span>

                  <span style={styles.subtotalValue}>{fmt(subtotal)}</span>
                </div>

                {hasCardIncome && (
                  <div
                    style={{
                      ...styles.cardFooter,

                      borderTop: "2px solid #E5E7EB",

                      backgroundColor: cardBalance >= 0 ? "#F0FDF4" : "#FEF2F2",
                    }}
                  >
                    <span
                      style={{
                        ...styles.subtotalLabel,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      Saldo
                    </span>

                    <span
                      style={{
                        fontSize: 16,

                        fontWeight: 700,

                        color: cardBalance >= 0 ? "#10B981" : "#EF4444",
                      }}
                    >
                      {fmt(cardBalance)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {Object.entries(expensesByCard)

        .filter(([name]) => !cards.some((c) => c.name === name))

        .map(([name, items]) => {
          const subtotal = items.reduce((sum, e) => sum + e.value, 0);

          return (
            <div key={name} style={{ ...styles.card, marginTop: 12 }}>
              <div style={styles.cardHeader}>
                <span style={styles.cardName}>{name}</span>

                <span style={styles.cardOwner}>Sem cadastro</span>
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.subtotalLabel}>Total</span>

                <span style={styles.subtotalValue}>{fmt(subtotal)}</span>
              </div>
            </div>
          );
        })}

      <div style={styles.grandTotal}>
        <span style={styles.grandTotalLabel}>Total Geral</span>

        <span style={styles.grandTotalValue}>{fmt(totalExpenses)}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginBottom: 20,
  },

  heading: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },

  addCardBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },

  addCardForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    border: "2px solid #2563EB",
  },

  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  confirmBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },

  cancelBtn: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
  },

  deleteCardBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    backgroundColor: "#FEF2F2",
    color: "#EF4444",
    cursor: "pointer",
  },

  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
  },

  cardName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },

  cardOwner: {
    fontSize: 12,
    color: "#6B7280",
  },

  dueBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    color: "#D97706",
    fontSize: 11,
    fontWeight: 600,
  },

  closingBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: 600,
  },

  sectionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 18px",
    borderTop: "1px solid #E5E7EB",
    flexWrap: "wrap",
    gap: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#7C3AED",
  },

  invoiceCheckLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },

  cardIncomeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 18px",
    backgroundColor: "#F0FDF4",
    borderBottom: "1px solid #D1FAE5",
  },

  cardIncomeLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#059669",
  },

  cardIncomeValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#10B981",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 18px",
    backgroundColor: "#F9FAFB",
    borderTop: "1px solid #E5E7EB",
  },

  subtotalLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#6B7280",
  },

  subtotalValue: {
    fontSize: 15,
    fontWeight: 700,
    color: "#2563EB",
  },

  grandTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    padding: "16px 24px",
    marginTop: 16,
    borderTop: "4px solid #EF4444",
  },

  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },

  grandTotalValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#EF4444",
  },
};
