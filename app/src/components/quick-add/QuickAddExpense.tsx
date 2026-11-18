import { useState } from "react";

import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  Heart,
  Sparkles,
  GraduationCap,
  Gamepad2,
  Shirt,
  CreditCard,
  FileText,
  PawPrint,
  Church,
  Users,
  Gift,
  Smartphone,
  Candy,
  ShieldCheck,
  Bike,
  Plane,
  MoreHorizontal,
  Check,
} from "lucide-react";

import { useFinance } from "../../contexts/FinanceContext";

import {
  CATEGORIES,
  type Category,
  type ExpenseType,
  type PaymentMethod,
} from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORY_ICONS: Record<string, any> = {
  Casa: Home,

  Alimentação: UtensilsCrossed,

  Mercado: ShoppingCart,

  Transporte: Car,

  Saúde: Heart,

  Beleza: Sparkles,

  Educação: GraduationCap,

  Lazer: Gamepad2,

  Vestuário: Shirt,

  Assinaturas: CreditCard,

  Contas: FileText,

  Pets: PawPrint,

  Igreja: Church,

  "Jovens Igreja": Users,

  Presente: Gift,

  Eletrônicos: Smartphone,

  Guloseimas: Candy,

  "Fundo de Emergência": ShieldCheck,

  Carro: Car,

  Moto: Bike,

  Viagens: Plane,

  Outros: MoreHorizontal,
};

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "geral", label: "Geral" },

  { value: "fixo", label: "Fixo" },

  { value: "parcelado", label: "Parcelado" },

  { value: "guardado", label: "Guardado" },
];

export default function QuickAddExpense() {
  const { cards, addExpense, monthYear } = useFinance();

  const [selectedCard, setSelectedCard] = useState("");

  const [rawValue, setRawValue] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");

  const [selectedType, setSelectedType] = useState<ExpenseType>("geral");

  const [description, setDescription] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credito");

  const [installmentTotal, setInstallmentTotal] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const numericValue = parseFloat(rawValue.replace(/\D/g, "")) / 100;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");

    setRawValue(digits);
  };

  const formattedValue =
    rawValue.length > 0
      ? (parseFloat(rawValue) / 100).toLocaleString("pt-BR", {
          style: "currency",

          currency: "BRL",
        })
      : "R$ 0,00";

  const canSubmit =
    selectedCard &&
    numericValue > 0 &&
    selectedCategory &&
    (selectedType !== "parcelado" ||
      (installmentTotal && parseInt(installmentTotal, 10) > 0));

  const handleSubmit = async () => {
    if (!canSubmit || !selectedCategory) return;

    setSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      await addExpense({
        description: description || selectedCategory,

        value: numericValue,

        category: selectedCategory,

        card: selectedCard,

        date: today,

        type: selectedType,

        paymentMethod,

        monthYear,

        createdBy: "",

        createdAt: new Date().toISOString(),

        ...(selectedType === "parcelado" && installmentTotal
          ? {
              installmentCurrent: 1,

              installmentTotal: parseInt(installmentTotal, 10),
            }
          : {}),
      });

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);

        setSelectedCard("");

        setRawValue("");

        setSelectedCategory("");

        setSelectedType("geral");

        setDescription("");

        setPaymentMethod("credito");

        setInstallmentTotal("");
      }, 1200);
    } catch (err) {
      console.error("Erro ao adicionar gasto:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div
        style={{
          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          justifyContent: "center",

          padding: "60px 20px",

          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,

            height: 64,

            borderRadius: "50%",

            background: "#10B981",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            animation: "fadeIn 0.3s ease",
          }}
        >
          <Check size={32} color="#FFFFFF" />
        </div>

        <p style={{ fontSize: 18, fontWeight: 600, color: "#10B981" }}>
          Gasto adicionado com sucesso!
        </p>
      </div>
    );
  }

  const cardBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "14px 20px",

    borderRadius: 10,

    border: active ? "2px solid #2563EB" : "2px solid #E5E7EB",

    background: active ? "#DBEAFE" : "#FFFFFF",

    color: active ? "#2563EB" : "#374151",

    fontWeight: active ? 700 : 500,

    fontSize: 15,

    cursor: "pointer",

    transition: "all 0.15s ease",

    textAlign: "center",

    minWidth: 100,

    flex: "1 1 auto",
  });

  const catBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    padding: "12px 8px",

    borderRadius: 10,

    border: active ? "2px solid #2563EB" : "2px solid #E5E7EB",

    background: active ? "#DBEAFE" : "#FFFFFF",

    color: active ? "#2563EB" : "#374151",

    fontWeight: active ? 600 : 400,

    fontSize: 11,

    cursor: "pointer",

    transition: "all 0.15s ease",
  });

  const typeBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 16px",

    borderRadius: 8,

    border: active ? "2px solid #2563EB" : "2px solid #E5E7EB",

    background: active ? "#DBEAFE" : "#FFFFFF",

    color: active ? "#2563EB" : "#374151",

    fontWeight: active ? 700 : 500,

    fontSize: 14,

    cursor: "pointer",

    transition: "all 0.15s ease",

    flex: "1 1 0",

    textAlign: "center",
  });

  return (
    <div style={{ padding: 16, maxWidth: 500, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>1. Selecione o cartão</span>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {cards.length === 0 && (
            <p style={{ color: "#6B7280", fontSize: 14 }}>
              Nenhum cartão cadastrado. Adicione um cartão primeiro.
            </p>
          )}

          {cards.map((card) => (
            <button
              key={card.id}

              type="button"

              style={cardBtnStyle(selectedCard === card.name)}

              onClick={() => setSelectedCard(card.name)}
            >
              <CreditCard
                size={18}
                style={{ marginRight: 6, verticalAlign: "middle" }}
              />

              {card.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>2. Valor</span>

        <input
          type="text"

          inputMode="numeric"

          placeholder="R$ 0,00"

          value={rawValue.length > 0 ? formattedValue : ""}

          onChange={handleValueChange}

          style={{
            width: "100%",

            fontSize: 32,

            fontWeight: 700,

            textAlign: "center",

            border: "2px solid #E5E7EB",

            borderRadius: 12,

            padding: 16,

            color: "#1F2937",

            background: "#FFFFFF",

            outline: "none",

            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>3. Categoria</span>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 8,
          }}
        >
          {CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat];

            return (
              <button
                key={cat}

                type="button"

                style={catBtnStyle(selectedCategory === cat)}

                onClick={() => setSelectedCategory(cat)}
              >
                <IconComp size={22} />

                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>4. Tipo</span>

        <div style={{ display: "flex", gap: 8 }}>
          {EXPENSE_TYPES.map((t) => (
            <button
              key={t.value}

              type="button"

              style={typeBtnStyle(selectedType === t.value)}

              onClick={() => setSelectedType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>5. Pagamento</span>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"

            style={typeBtnStyle(paymentMethod === "credito")}

            onClick={() => setPaymentMethod("credito")}
          >
            Crédito
          </button>

          <button
            type="button"

            style={typeBtnStyle(paymentMethod === "debito")}

            onClick={() => setPaymentMethod("debito")}
          >
            Débito
          </button>
        </div>
      </div>

      {selectedType === "parcelado" && (
        <div style={{ marginBottom: 24 }}>
          <span style={styles.label}>6. Quantidade de Parcelas</span>

          <input
            type="text"

            inputMode="numeric"

            placeholder="Ex: 12"

            value={installmentTotal}

            onChange={(e) =>
              setInstallmentTotal(e.target.value.replace(/\D/g, ""))
            }

            style={{
              width: "100%",

              fontSize: 20,

              fontWeight: 600,

              textAlign: "center",

              border: "2px solid #E5E7EB",

              borderRadius: 10,

              padding: 14,

              color: "#1F2937",

              background: "#FFFFFF",

              outline: "none",

              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <span style={styles.label}>
          {selectedType === "parcelado" ? "7" : "6"}. Descrição (opcional)
        </span>

        <input
          type="text"

          placeholder="Ex: Supermercado, Aluguel..."

          value={description}

          onChange={(e) => setDescription(e.target.value)}

          style={{
            width: "100%",

            fontSize: 15,

            border: "2px solid #E5E7EB",

            borderRadius: 10,

            padding: "14px 16px",

            color: "#1F2937",

            background: "#FFFFFF",

            outline: "none",

            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        type="button"

        style={{
          width: "100%",

          padding: 16,

          borderRadius: 12,

          border: "none",

          background: canSubmit ? "#2563EB" : "#9CA3AF",

          color: "#FFFFFF",

          fontSize: 18,

          fontWeight: 700,

          cursor: canSubmit ? "pointer" : "not-allowed",

          transition: "all 0.15s ease",

          opacity: submitting ? 0.7 : 1,
        }}

        onClick={handleSubmit}

        disabled={!canSubmit || submitting}
      >
        {submitting ? "Adicionando..." : "Adicionar"}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: {
    fontSize: 14,

    fontWeight: 600,

    color: "#374151",

    marginBottom: 10,

    display: "block",
  },
};