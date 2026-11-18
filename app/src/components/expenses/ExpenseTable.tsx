import { useState } from "react";
import { useFinance } from "../../contexts/FinanceContext";
import type {
  ExpenseType,
  Category,
  Expense,
  PaymentMethod,
} from "../../types";
import {
  CATEGORIES,
  EXPENSE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../../types";
import Modal from "../common/Modal";

interface ExpenseTableProps {
  type: ExpenseType;
  title: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

const emptyForm = {
  description: "",
  value: "",
  category: "Outros" as Category,
  card: "",
  date: "",
  paymentMethod: "credito" as PaymentMethod,
  installmentCurrent: "",
  installmentTotal: "",
};

export default function ExpenseTable({ type, title }: ExpenseTableProps) {
  const {
    expensesByType,
    cards,
    monthYear,
    addExpense,
    updateExpense,

    deleteExpense,
  } = useFinance();
  const allOfType = expensesByType[type] || [];
  const [filterCard, setFilterCard] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm(emptyForm);
    setShowAdd(false);
  }

  async function handleAdd() {
    if (!form.description || !form.value) return;

    setSaving(true);

    try {
      await addExpense({
        description: form.description,
        value: parseFloat(form.value.replace(",", ".")),
        category: form.category,
        card: form.card || (cards.length > 0 ? cards[0].name : ""),
        date: form.date || new Date().toISOString().slice(0, 10),
        type,
        paymentMethod: form.paymentMethod,
        monthYear,
        createdBy: "user",
        createdAt: new Date().toISOString(),

        ...(type === "parcelado" && form.installmentTotal
          ? {
              installmentCurrent: 1,
              installmentTotal: parseInt(form.installmentTotal, 10),
            }
          : {}),
      });

      resetForm();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(expense: Expense) {
    setEditId(expense.id);

    setEditForm({
      description: expense.description,
      value: String(expense.value),
      category: expense.category,
      card: expense.card,
      date: expense.date,
      paymentMethod: expense.paymentMethod || "credito",
      installmentCurrent: expense.installmentCurrent
        ? String(expense.installmentCurrent)
        : "",

      installmentTotal: expense.installmentTotal
        ? String(expense.installmentTotal)
        : "",
    });
  }

  async function handleSaveEdit() {
    if (!editId || !editForm.description || !editForm.value) return;

    setSaving(true);

    try {
      await updateExpense(editId, {
        description: editForm.description,
        value: parseFloat(editForm.value.replace(",", ".")),
        category: editForm.category,
        card: editForm.card,
        date: editForm.date,
        paymentMethod: editForm.paymentMethod,

        ...(type === "parcelado" &&
        editForm.installmentCurrent &&
        editForm.installmentTotal
          ? {
              installmentCurrent: parseInt(editForm.installmentCurrent, 10),

              installmentTotal: parseInt(editForm.installmentTotal, 10),
            }
          : {}),
      });

      setEditId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja excluir este gasto?")) {
      await deleteExpense(id);
    }
  }

  const filtered = allOfType.filter((e) => {
    if (filterCard && e.card !== filterCard) return false;

    if (filterCategory && e.category !== filterCategory) return false;

    return true;
  });

  const subtotal = filtered.reduce((sum, e) => sum + e.value, 0);

  // Cartões e categorias presentes neste tipo (para os filtros)

  const cardOptions = [...new Set(allOfType.map((e) => e.card))]
    .filter(Boolean)
    .sort();

  const categoryOptions = [...new Set(allOfType.map((e) => e.category))].sort();
  const isParcelado = type === "parcelado";
  const isGuardado = type === "guardado";
  const isFixo = type === "fixo";
  const showDate = !isParcelado && !isGuardado;
  const showPaid = isFixo;

  async function handleTogglePaid(id: string, currentPaid: boolean) {
    await updateExpense(id, { paid: !currentPaid });
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {title} <span style={styles.badge}>{EXPENSE_TYPE_LABELS[type]}</span>
        </h3>

        <div style={styles.headerRight}>
          <span style={styles.subtotal}>Subtotal: {fmt(subtotal)}</span>

          <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
            + Adicionar
          </button>
        </div>
      </div>

      {allOfType.length > 0 && (
        <div style={styles.filterBar}>
          <select
            style={styles.filterSelect}
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
          >
            <option value="">Todos os cartões</option>

            {cardOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            style={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>

            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(filterCard || filterCategory) && (
            <button
              style={styles.clearFilterBtn}

              onClick={() => {
                setFilterCard("");
                setFilterCategory("");
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Descrição</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Valor</th>
              <th style={styles.th}>Categoria</th>
              <th style={styles.th}>Cartão</th>
              <th style={styles.th}>Pagamento</th>

              {showDate && <th style={styles.th}>Data</th>}
              {isParcelado && <th style={styles.th}>Parcela</th>}
              {showPaid && (
                <th style={{ ...styles.th, textAlign: "center", width: 50 }}>
                  Pago
                </th>
              )}

              <th style={{ ...styles.th, width: 90 }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={
                    5 +
                    (showDate ? 1 : 0) +
                    (isParcelado ? 1 : 0) +
                    (showPaid ? 1 : 0) +
                    1
                  }

                  style={{
                    ...styles.td,
                    textAlign: "center",
                    color: "#9CA3AF",
                  }}
                >
                  Nenhum gasto registrado
                </td>
              </tr>
            )}

            {filtered.map((expense) =>
              editId === expense.id ? (
                <tr key={expense.id} style={{ backgroundColor: "#FEF9C3" }}>
                  <td style={styles.td}>
                    <input
                      style={styles.input}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </td>

                  <td style={styles.td}>
                    <input
                      style={{ ...styles.input, textAlign: "right" }}
                      value={editForm.value}
                      onChange={(e) =>
                        setEditForm({ ...editForm, value: e.target.value })
                      }

                      placeholder="0,00"
                    />
                  </td>

                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,

                          category: e.target.value as Category,
                        })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={editForm.card}
                      onChange={(e) =>
                        setEditForm({ ...editForm, card: e.target.value })
                      }
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={editForm.paymentMethod}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          paymentMethod: e.target.value as PaymentMethod,
                        })
                      }
                    >
                      <option value="credito">Crédito</option>
                      <option value="debito">Débito</option>
                    </select>
                  </td>

                  {showDate && (
                    <td style={styles.td}>
                      <input
                        type="date"
                        style={styles.input}
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                      />
                    </td>
                  )}

                  {isParcelado && (
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <input
                          style={{
                            ...styles.input,
                            width: 40,
                            textAlign: "center",
                          }}
                          value={editForm.installmentCurrent}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              installmentCurrent: e.target.value,
                            })
                          }
                        />

                        <span>/</span>

                        <input
                          style={{
                            ...styles.input,
                            width: 40,
                            textAlign: "center",
                          }}
                          value={editForm.installmentTotal}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,

                              installmentTotal: e.target.value,
                            })
                          }
                        />
                      </div>
                    </td>
                  )}

                  {showPaid && (
                    <td style={{ ...styles.td, textAlign: "center" }}>—</td>
                  )}

                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={styles.saveBtn}
                        onClick={handleSaveEdit}
                        disabled={saving}
                      >
                        Salvar
                      </button>

                      <button
                        style={styles.cancelSmBtn}

                        onClick={() => setEditId(null)}
                      >
                        X
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={expense.id}

                  style={{
                    ...styles.row,

                    opacity: expense.paid ? 0.6 : 1,
                  }}
                >
                  <td
                    style={{
                      ...styles.td,

                      textDecoration: expense.paid ? "line-through" : "none",
                    }}
                  >
                    {expense.description}
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      textAlign: "right",
                      fontWeight: 600,
                    }}
                  >
                    {fmt(expense.value)}
                  </td>

                  <td style={styles.td}>{expense.category}</td>

                  <td style={styles.td}>{expense.card}</td>

                  <td style={styles.td}>
                    {PAYMENT_METHOD_LABELS[expense.paymentMethod || "credito"]}
                  </td>

                  {showDate && <td style={styles.td}>{expense.date}</td>}

                  {isParcelado && (
                    <td style={styles.td}>
                      {expense.installmentCurrent}/{expense.installmentTotal}
                    </td>
                  )}

                  {showPaid && (
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!expense.paid}
                        onChange={() =>
                          handleTogglePaid(expense.id, !!expense.paid)
                        }

                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "#10B981",
                          cursor: "pointer",
                        }}

                        title={
                          expense.paid
                            ? "Marcar como não pago"
                            : "Marcar como pago"
                        }
                      />
                    </td>
                  )}

                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        style={styles.editBtn}

                        onClick={() => startEdit(expense)}
                      >
                        Editar
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(expense.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showAdd}
        onClose={resetForm}
        title={`Adicionar ${EXPENSE_TYPE_LABELS[type]}`}
      >
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Descrição</label>

            <input
              style={styles.input}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }

              placeholder="Ex: Aluguel, Netflix..."
            />
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Valor (R$)</label>

            <input
              style={styles.input}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Categoria</label>

            <select
              style={styles.select}
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as Category })
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Cartão</label>

            <select
              style={styles.select}
              value={form.card}
              onChange={(e) => setForm({ ...form, card: e.target.value })}
            >
              <option value="">Selecione...</option>

              {cards.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Pagamento</label>

            <select
              style={styles.select}
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod: e.target.value as PaymentMethod,
                })
              }
            >
              <option value="credito">Crédito</option>

              <option value="debito">Débito</option>
            </select>
          </div>

          {showDate && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Data</label>

              <input
                type="date"
                style={styles.input}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          )}

          {isParcelado && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Quantidade de Parcelas</label>

              <input
                style={styles.input}
                value={form.installmentTotal}
                onChange={(e) =>
                  setForm({ ...form, installmentTotal: e.target.value })
                }

                placeholder="Ex: 12"
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <button style={styles.cancelBtn} onClick={resetForm}>
            Cancelar
          </button>

          <button
            style={styles.confirmBtn}
            onClick={handleAdd}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden",
    marginBottom: 20,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    padding: "16px 20px",
    borderBottom: "1px solid #E5E7EB",
  },

  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  badge: {
    fontSize: 11,
    fontWeight: 500,
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    padding: "2px 8px",
    borderRadius: 20,
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  subtotal: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },

  addBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },

  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 20px",
    backgroundColor: "#F9FAFB",
    borderBottom: "1px solid #E5E7EB",
    flexWrap: "wrap",
  },

  filterSelect: {
    padding: "5px 8px",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    fontSize: 12,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    outline: "none",
    cursor: "pointer",
  },

  clearFilterBtn: {
    padding: "4px 10px",
    border: "none",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    cursor: "pointer",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },

  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #E5E7EB",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #F3F4F6",
    color: "#374151",
    whiteSpace: "nowrap",
  },

  row: {
    transition: "background-color 0.1s",
  },

  input: {
    width: "100%",
    padding: "6px 10px",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    padding: "6px 10px",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
  },

  editBtn: {
    backgroundColor: "transparent",
    color: "#2563EB",
    border: "1px solid #2563EB",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  deleteBtn: {
    backgroundColor: "transparent",
    color: "#EF4444",
    border: "1px solid #EF4444",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  saveBtn: {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  cancelSmBtn: {
    backgroundColor: "#F3F4F6",
    color: "#374151",
    border: "1px solid #D1D5DB",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
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

  confirmBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 8,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#6B7280",
  },
};