import CategoryPieChart from './CategoryPieChart';
import IdealVsRealChart from './IdealVsRealChart';

export default function ChartSection() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '16px 0' }}>
      <CategoryPieChart />
      <IdealVsRealChart />
    </div>
  );
}