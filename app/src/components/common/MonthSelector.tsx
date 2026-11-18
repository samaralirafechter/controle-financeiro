import { format, parse, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useFinance } from "../../contexts/FinanceContext";

export default function MonthSelector() {
  const { monthYear, setMonthYear } = useFinance();
  const currentDate = parse(monthYear, "yyyy-MM", new Date());
  const label = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  function handlePrev() {
    const prev = subMonths(currentDate, 1);

    setMonthYear(format(prev, "yyyy-MM"));
  }

  function handleNext() {
    const next = addMonths(currentDate, 1);

    setMonthYear(format(next, "yyyy-MM"));
  }

  return (
    <div style={styles.container}>
      <button
        onClick={handlePrev}
        style={styles.arrow}
        aria-label="Mês anterior"
      >
        ◀
      </button>

      <span style={styles.label}>{capitalizedLabel}</span>

      <button
        onClick={handleNext}
        style={styles.arrow}
        aria-label="Próximo mês"
      >
        ▶
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "12px 0",
  },

  arrow: {
    background: "none",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    width: 40,
    height: 40,
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563EB",
    transition: "background-color 0.15s",
  },

  label: {
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
    minWidth: 200,
    textAlign: "center",
  },
};
