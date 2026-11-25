export interface Expense {
  id: string;
  description: string;
  value: number;
  category: Category;
  card: string;
  date: string; // ISO date string
  type: ExpenseType;
  paymentMethod?: PaymentMethod;
  paid?: boolean; // marca se o gasto foi pago
  installmentCurrent?: number;
  installmentTotal?: number;
  monthYear: string; // "2024-01" format for filtering
  createdBy: string;
  createdAt: string;
  groupId?: string; // vincula gastos fixos/parcelados entre meses
}

export type ExpenseType = 'fixo' | 'parcelado' | 'geral' | 'guardado';

export type PaymentMethod = 'credito' | 'debito';

// Categorias fixas do Cofrinho
export type SavingsCategory =
  | 'Casa'
  | 'Carro'
  | 'Viagens'
  | 'Emergência';

// Registro de valor guardado
export interface Saving {
  id: string;
  category: SavingsCategory;
  value: number;
  date: string;
  monthYear: string;
  createdAt: string;
  createdBy: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credito: 'Crédito',
  debito: 'Débito',
};

export type Category =
  | 'Casa'
  | 'Alimentação'
  | 'Mercado'
  | 'Transporte'
  | 'Saúde'
  | 'Beleza'
  | 'Educação'
  | 'Lazer'
  | 'Vestuário'
  | 'Assinaturas'
  | 'Contas'
  | 'Pets'
  | 'Igreja'
  | 'Jovens Igreja'
  | 'Presente'
  | 'Eletrônicos'
  | 'Guloseimas'
  | 'Fundo de Emergência'
  | 'Carro'
  | 'Moto'
  | 'Viagens'
  | 'Outros';

export const CATEGORIES: Category[] = [
  'Casa',
  'Alimentação',
  'Mercado',
  'Transporte',
  'Saúde',
  'Beleza',
  'Educação',
  'Lazer',
  'Vestuário',
  'Assinaturas',
  'Contas',
  'Pets',
  'Igreja',
  'Jovens Igreja',
  'Presente',
  'Eletrônicos',
  'Guloseimas',
  'Fundo de Emergência',
  'Carro',
  'Moto',
  'Viagens',
  'Outros',
];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  fixo: 'Gasto Fixo',
  parcelado: 'Gasto Parcelado',
  geral: 'Gasto Geral',
  guardado: 'Guardado',
};

export interface Income {
  id: string;
  description: string;
  value: number;
  person: string;
  date: string;
  monthYear: string;
  createdAt: string;
  groupId?: string; // vincula entradas fixas entre meses
  card?: string; // vincula entrada a um cartão (ex: Ticket VR, Ticket VA)
}

export interface Card {
  id: string;
  name: string;
  owner: string;
  dueDay?: number; // dia do vencimento da fatura (1-31)
  closingDay?: number; // dia de fechamento da fatura (1-31)
}

/**
* Calcula o monthYear correto para um gasto no crédito baseado no dia de fechamento.
* - compra antes -> fatura do mês seguinte (monthYear = mês atual +1)
* - compra depois ou no dia de fechamento -> fatura de 2 meses à frente (monthYear = mês atual +2)
* - Se closingDay não definida, usa mês seguinte (monthYear = mês atual +1)
*/

export function getCreditMonthYear(purchaseDate: string, closingDay?: number): string {

    const date = new Date(purchaseDate + 'T12:00:00');
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (!closingDay || day < closingDay) {
        //Antes do fechamento ou zerado -> fatura do mês seguinte
        const m = month + 1;
        const newMonth = m % 12;
        const newYear = year + Math.floor(m / 12);
        return `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
        } else {
            //Depois do fechamento -> fatura de 2 meses à frente
            const m = month + 2;
            const newMonth = m % 12;
            const newYear = year + Math.floor(m / 12);
            return `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;
            }
        }

export interface MonthData {
  monthYear: string;
  expenses: Expense[];
  incomes: Income[];
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  'Casa': '#FF6384',
  'Alimentação': '#36A2EB',
  'Mercado': '#2DD4BF',
  'Transporte': '#FFCE56',
  'Saúde': '#4BC0C0',
  'Beleza': '#F472B6',
  'Educação': '#9966FF',
  'Lazer': '#FF9F40',
  'Vestuário': '#E879F9',
  'Assinaturas': '#C9CBCF',
  'Contas': '#F87171',
  'Pets': '#7BC043',
  'Igreja': '#A78BFA',
  'Jovens Igreja': '#818CF8',
  'Presente': '#FB923C',
  'Eletrônicos': '#38BDF8',
  'Guloseimas': '#F9A8D4',
  'Fundo de Emergência': '#34D399',
  'Carro': '#FBBF24',
  'Moto': '#A3E635',
  'Viagens': '#22D3EE',
  'Outros': '#8B8B8B',
};