import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useFinance } from "../../contexts/FinanceContext";

import { CATEGORY_COLORS, type Category } from "../../types";

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (percent < 0.03) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);

  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export default function CategoryPieChart() {
  const { expensesByCategory } = useFinance();
  const data = Object.entries(expensesByCategory)

    .filter(([, info]) => info.total > 0)
    .map(([name, info]) => ({
      name,
      value: info.total,
      color: CATEGORY_COLORS[name as Category] || "#8B8B8B",
    }));

  if (data.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Gastos por Categoria</h3>
        <div style={styles.empty}>Sem gastos neste mês</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Gastos por Categoria</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), "Valor"]}

            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "13px",
            }}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />
        </PieChart>
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
