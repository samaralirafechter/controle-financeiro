import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FinanceProvider } from './contexts/FinanceContext';
import Dashboard from './pages/Dashboard';
import QuickAddPage from './pages/QuickAddPage';

function FloatingActionButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: '#2563EB',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={() => navigate('/add')}
      aria-label="Adicionar gasto"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<QuickAddPage />} />
      </Routes>
      <FloatingActionButton />
    </>
  );
}


export default function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FinanceProvider>
  );
}