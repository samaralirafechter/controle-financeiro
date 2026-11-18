import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuickAddExpense from '../components/quick-add/QuickAddExpense';

export default function QuickAddPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={styles.title}>Novo Gasto</h1>
      </header>
      <QuickAddExpense />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F3F4F6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 10,
    border: 'none',
    background: '#F3F4F6',
    cursor: 'pointer',
    color: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1F2937',
    margin: 0,
  },
};