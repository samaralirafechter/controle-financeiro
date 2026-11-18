import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useFinance } from "../../contexts/FinanceContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export default function IdealVsRealChart() {
  const { totalIncomes, expensesByType } = useFinance();

  if (totalIncomes <= 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Ideal vs Real (50/30/20)</h3>

        <div style={styles.empty}>Adicione entradas para ver a comparação</div>
      </div>
    );
  }

  const sumByType = (expenses: typeof expensesByType.fixo) =>
    expenses.reduce((sum, e) => sum + e.value, 0);

  const realFixo = sumByType(expensesByType.fixo || []);

  const realVariavel =
    sumByType(expensesByType.parcelado || []) +
    sumByType(expensesByType.geral || []);

  const realGuardado = sumByType(expensesByType.guardado || []);

  const data = [
    {
      name: "Gastos Fixos",
      Ideal: totalIncomes * 0.5,
      Real: realFixo,
    },

    {
      name: "Gastos Variáveis",
      Ideal: totalIncomes * 0.3,
      Real: realVariavel,
    },

    {
      name: "Guardado",
      Ideal: totalIncomes * 0.2,
      Real: realGuardado,
    },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Ideal vs Real (50/30/20)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v: number) => formatCurrency(v)}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
            width={90}
          />

          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name),
            ]}

            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "13px",
            }}
          />

          <Legend
            iconType="rect"
            iconSize={12}
            wrapperStyle={{ fontSize: "13px", paddingTop: "8px" }}
          />

          <Bar dataKey="Ideal" fill="#93C5FD" radius={[4, 4, 0, 0]} />

          <Bar dataKey="Real" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flex: "1 1 400px",
    minHeight: 360,
  },

  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
    margin: "0 0 16px 0",
  },

  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 280,
    color: "#6B7280",
    fontSize: 14,
  },
};