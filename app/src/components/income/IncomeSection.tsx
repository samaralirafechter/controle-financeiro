import { useState, useMemo } from "react";

import { Pencil, Trash2, Check, X } from "lucide-react";

import { useFinance } from "../../contexts/FinanceContext";

import type { Income } from "../../types";

import Modal from "../common/Modal";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

const emptyForm = {
  description: "",

  value: "",

  person: "",

  card: "",
};

export default function IncomeSection() {
  const { incomes, cards, monthYear, addIncome, updateIncome, deleteIncome } =
    useFinance();

  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [replicateFuture, setReplicateFuture] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  const personSuggestions = useMemo(() => {
    const names = new Set(incomes.map((i) => i.person));

    return Array.from(names).sort();
  }, [incomes]);

  const grouped = useMemo(() => {
    const map: Record<string, Income[]> = {};

    for (const inc of incomes) {
      const key = inc.person || "Sem pessoa";

      if (!map[key]) map[key] = [];

      map[key].push(inc);
    }

    return map;
  }, [incomes]);

  const grandTotal = incomes.reduce((sum, i) => sum + i.value, 0);

  function resetForm() {
    setForm(emptyForm);

    setShowAdd(false);
  }

  async function handleAdd() {
    if (!form.description || !form.value || !form.person) return;

    setSaving(true);

    try {
      await addIncome(
        {
          description: form.description,

          value: parseFloat(form.value.replace(",", ".")),

          person: form.person,

          date: new Date().toISOString().slice(0, 10),

          monthYear,

          createdAt: new Date().toISOString(),

          ...(form.card ? { card: form.card } : {}),
        },

        replicateFuture,
      );

      resetForm();
    } catch (err) {
      console.error("Erro ao adicionar entrada:", err);

      alert(
        "Erro ao salvar: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(income: Income) {
    setEditId(income.id);

    setEditForm({
      description: income.description,

      value: String(income.value),

      person: income.person,

      card: income.card || "",
    });
  }

  async function handleSaveEdit() {
    if (!editId || !editForm.description || !editForm.value) return;

    setSaving(true);

    try {
      await updateIncome(editId, {
        description: editForm.description,

        value: parseFloat(editForm.value.replace(",", ".")),

        person: editForm.person,

        ...(editForm.card ? { card: editForm.card } : { card: "" }),
      });

      setEditId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Tem certeza que deseja excluir esta entrada?")) {
      await deleteIncome(id);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Entradas</h3>

        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          + Adicionar Entrada
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Descrição</th>

              <th style={{ ...styles.th, textAlign: "right" }}>Valor</th>

              <th style={styles.th}>Pessoa</th>

              <th style={{ ...styles.th, width: 70, textAlign: "center" }}></th>
            </tr>
          </thead>

          <tbody>
            {incomes.length === 0 && (
              <tr>
                <td
                  colSpan={4}

                  style={{
                    ...styles.td,
                    textAlign: "center",
                    color: "#9CA3AF",
                  }}
                >
                  Nenhuma entrada registrada
                </td>
              </tr>
            )}

            {Object.values(grouped)
              .flat()
              .map((income) =>
                editId === income.id ? (
                  <tr key={income.id} style={{ backgroundColor: "#FEF9C3" }}>
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
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        style={styles.input}

                        value={editForm.person}

                        onChange={(e) =>
                          setEditForm({ ...editForm, person: e.target.value })
                        }

                        list="person-suggestions-edit"
                      />

                      <datalist id="person-suggestions-edit">
                        {personSuggestions.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          style={styles.iconBtnSave}

                          onClick={handleSaveEdit}

                          disabled={saving}

                          title="Salvar"
                        >
                          <Check size={16} />
                        </button>

                        <button
                          style={styles.iconBtnCancel}

                          onClick={() => setEditId(null)}

                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={income.id}>
                    <td style={styles.td}>{income.description}</td>

                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      {fmt(income.value)}
                    </td>

                    <td style={styles.td}>{income.person}</td>

                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          justifyContent: "center",
                        }}
                      >
                        <button
                          style={styles.iconBtnEdit}

                          onClick={() => startEdit(income)}

                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          style={styles.iconBtnDelete}

                          onClick={() => handleDelete(income.id)}

                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
          </tbody>
        </table>
      </div>

      <div style={styles.totalsSection}>
        {Object.entries(grouped).map(([person, items]) => {
          const personTotal = items.reduce((sum, i) => sum + i.value, 0);

          return (
            <div key={person} style={styles.personTotal}>
              <span style={styles.personName}>{person}</span>

              <span style={styles.personValue}>{fmt(personTotal)}</span>
            </div>
          );
        })}

        <div style={styles.grandTotal}>
          <span style={styles.grandTotalLabel}>Total Entradas</span>

          <span style={styles.grandTotalValue}>{fmt(grandTotal)}</span>
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={resetForm} title="Adicionar Entrada">
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Descrição</label>

            <input
              style={styles.input}

              value={form.description}

              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }

              placeholder="Ex: Salário, Adiantamento..."
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
            <label style={styles.fieldLabel}>Pessoa</label>

            <input
              style={styles.input}

              value={form.person}

              onChange={(e) => setForm({ ...form, person: e.target.value })}

              list="person-suggestions-add"

              placeholder="Nome da pessoa"
            />

            <datalist id="person-suggestions-add">
              {personSuggestions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Cartão (opcional)</label>

            <select
              style={styles.select}

              value={form.card}

              onChange={(e) => setForm({ ...form, card: e.target.value })}
            >
              <option value="">Nenhum</option>

              {cards.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          style={{
            display: "flex",

            alignItems: "center",

            gap: 8,

            marginTop: 16,

            fontSize: 14,

            color: "#374151",

            cursor: "pointer",

            userSelect: "none",
          }}
        >
          <input
            type="checkbox"

            checked={replicateFuture}

            onChange={(e) => setReplicateFuture(e.target.checked)}

            style={{
              width: 18,
              height: 18,
              accentColor: "#10B981",
              cursor: "pointer",
            }}
          />
          Replicar nos próximos 12 meses
        </label>

        <div
          style={{
            display: "flex",

            gap: 8,

            justifyContent: "flex-end",

            marginTop: 16,
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

const iconBtnBase: React.CSSProperties = {
  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  width: 30,

  height: 30,

  borderRadius: 6,

  border: "none",

  cursor: "pointer",

  transition: "opacity 0.15s",
};

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
  },

  addBtn: {
    backgroundColor: "#10B981",

    color: "#FFFFFF",

    border: "none",

    borderRadius: 8,

    padding: "8px 16px",

    fontSize: 13,

    fontWeight: 500,

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

  iconBtnEdit: {
    ...iconBtnBase,

    backgroundColor: "#EFF6FF",

    color: "#2563EB",
  },

  iconBtnDelete: {
    ...iconBtnBase,

    backgroundColor: "#FEF2F2",

    color: "#EF4444",
  },

  iconBtnSave: {
    ...iconBtnBase,

    backgroundColor: "#D1FAE5",

    color: "#059669",
  },

  iconBtnCancel: {
    ...iconBtnBase,

    backgroundColor: "#F3F4F6",

    color: "#6B7280",
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
    backgroundColor: "#10B981",

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

  totalsSection: {
    padding: "12px 20px 16px",

    borderTop: "1px solid #E5E7EB",
  },

  personTotal: {
    display: "flex",

    justifyContent: "space-between",

    padding: "4px 0",
  },

  personName: {
    fontSize: 14,

    color: "#6B7280",
  },

  personValue: {
    fontSize: 14,

    fontWeight: 600,

    color: "#374151",
  },

  grandTotal: {
    display: "flex",

    justifyContent: "space-between",

    borderTop: "1px solid #E5E7EB",

    marginTop: 8,

    paddingTop: 8,
  },

  grandTotalLabel: {
    fontSize: 15,

    fontWeight: 700,

    color: "#111827",
  },

  grandTotalValue: {
    fontSize: 18,

    fontWeight: 700,

    color: "#10B981",
  },
};
