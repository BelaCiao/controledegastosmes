import { useState, useEffect } from "react";
import { Transaction, Debt, Goal } from "@/lib/types";
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

const INITIAL_TRANSACTIONS = [
  // Mês 6 (Junho)
  { id: '1', type: 'entrada', categoryId: 'salario', description: 'SALARIO (Mês 6)', amount: 2069.00, date: '2026-06-07T12:00:00Z' },
  { id: '2', type: 'entrada', categoryId: 'renda-extra', description: 'SALARIO GABRIELLE (Mês 6)', amount: 1600.00, date: '2026-06-07T12:00:00Z' },
  { id: '3', type: 'entrada', categoryId: 'renda-extra', description: 'Renda Extra', amount: 190.00, date: '2026-06-07T12:00:00Z' },
  { id: '4', type: 'saida', categoryId: 'filhas', description: 'PENSAO BIA', amount: 600.00, date: '2026-06-07T12:00:00Z' },
  { id: '5', type: 'saida', categoryId: 'mercado', description: 'hiper', amount: 619.00, date: '2026-06-07T12:00:00Z' },
  { id: '6', type: 'saida', categoryId: 'educacao', description: 'FACULDADE', amount: 160.00, date: '2026-06-07T12:00:00Z' },
  { id: '7', type: 'saida', categoryId: 'moradia', description: 'LUZ', amount: 300.00, date: '2026-06-07T12:00:00Z' },
  { id: '8', type: 'saida', categoryId: 'mercado', description: 'erva', amount: 50.00, date: '2026-06-07T12:00:00Z' },
  { id: '9', type: 'saida', categoryId: 'telecom', description: 'OSIR', amount: 116.00, date: '2026-06-07T12:00:00Z' },
  { id: '10', type: 'saida', categoryId: 'transporte', description: 'carro oficina', amount: 650.00, date: '2026-06-07T12:00:00Z' },
  { id: '11', type: 'saida', categoryId: 'moradia', description: 'CIBELE', amount: 320.00, date: '2026-06-07T12:00:00Z' },
  { id: '12', type: 'saida', categoryId: 'telecom', description: 'vivo', amount: 100.00, date: '2026-06-07T12:00:00Z' },
  { id: '13', type: 'saida', categoryId: 'saude', description: 'consulta kelly', amount: 136.00, date: '2026-06-07T12:00:00Z' },
  { id: '14', type: 'saida', categoryId: 'saude', description: 'consulta psiq', amount: 450.00, date: '2026-06-07T12:00:00Z' },
  { id: '15', type: 'saida', categoryId: 'ferramentas', description: 'cursor', amount: 105.00, date: '2026-06-07T12:00:00Z' },
  { id: '16', type: 'saida', categoryId: 'filhas', description: 'guardar p bia', amount: 253.00, date: '2026-06-07T12:00:00Z' },
  
  // Mês 7 (Julho) - Holerite Vencimentos
  { id: '17', type: 'entrada', categoryId: 'salario', description: 'Horas Normais (06/2026)', amount: 1387.14, date: '2026-07-01T12:00:00Z' },
  { id: '18', type: 'entrada', categoryId: 'salario', description: 'Horas Normais Noturnas', amount: 358.02, date: '2026-07-01T12:00:00Z' },
  { id: '19', type: 'entrada', categoryId: 'salario', description: 'Horas Extras c/ 100%', amount: 169.09, date: '2026-07-01T12:00:00Z' },
  { id: '20', type: 'entrada', categoryId: 'salario', description: 'DSR Reflexo H.Extras', amount: 42.27, date: '2026-07-01T12:00:00Z' },
  { id: '21', type: 'entrada', categoryId: 'salario', description: 'Adicional Noturno', amount: 84.56, date: '2026-07-01T12:00:00Z' },
  { id: '22', type: 'entrada', categoryId: 'salario', description: 'Periculosidade', amount: 541.67, date: '2026-07-01T12:00:00Z' },
  { id: '23', type: 'entrada', categoryId: 'salario', description: 'DSR Adic. Noturno', amount: 36.24, date: '2026-07-01T12:00:00Z' },
  { id: '24', type: 'entrada', categoryId: 'salario', description: 'Horas Noturnas Reduzidas', amount: 60.40, date: '2026-07-01T12:00:00Z' },
  { id: '25', type: 'entrada', categoryId: 'salario', description: 'Premiação Sup Metas ADM', amount: 567.18, date: '2026-07-01T12:00:00Z' },
  { id: '30', type: 'entrada', categoryId: 'renda-extra', description: 'SALÁRIO GABRIELLE (Mês 7)', amount: 1600.00, date: '2026-07-05T12:00:00Z' },

  // Mês 7 (Julho) - Holerite Descontos e Fixos
  { id: '26', type: 'saida', categoryId: 'impostos', description: 'Desconto INSS', amount: 216.82, date: '2026-07-01T12:00:00Z' },
  { id: '27', type: 'saida', categoryId: 'alimentacao', description: 'Vale Alimentação', amount: 225.00, date: '2026-07-01T12:00:00Z' },
  { id: '28', type: 'saida', categoryId: 'outros', description: 'Emp. Consignado CLT', amount: 348.11, date: '2026-07-01T12:00:00Z' },
  { id: '29', type: 'saida', categoryId: 'outros', description: 'Emp. Consignado CLT 3', amount: 387.81, date: '2026-07-01T12:00:00Z' },
  
  // Despesas Fixas (Julho)
  { id: '31', type: 'saida', categoryId: 'filhas', description: 'Pensão Bia', amount: 600.00, date: '2026-07-10T12:00:00Z' },
  { id: '32', type: 'saida', categoryId: 'moradia', description: 'Cibele (Moradia)', amount: 320.00, date: '2026-07-10T12:00:00Z' },
  { id: '33', type: 'saida', categoryId: 'moradia', description: 'Luz', amount: 300.00, date: '2026-07-10T12:00:00Z' },
  { id: '34', type: 'saida', categoryId: 'telecom', description: 'Internet (OSIR)', amount: 116.00, date: '2026-07-10T12:00:00Z' },
  { id: '35', type: 'saida', categoryId: 'telecom', description: 'Vivo', amount: 100.00, date: '2026-07-10T12:00:00Z' },
  { id: '36', type: 'saida', categoryId: 'educacao', description: 'Faculdade', amount: 160.00, date: '2026-07-10T12:00:00Z' },
  { id: '37', type: 'saida', categoryId: 'mercado', description: 'Hiper (Mercado)', amount: 619.00, date: '2026-07-10T12:00:00Z' },
  { id: '38', type: 'saida', categoryId: 'mercado', description: 'Erva', amount: 50.00, date: '2026-07-10T12:00:00Z' },
  { id: '39', type: 'saida', categoryId: 'ferramentas', description: 'Cursor', amount: 105.00, date: '2026-07-10T12:00:00Z' },
  { id: '40', type: 'saida', categoryId: 'saude', description: 'Consulta Kelly', amount: 136.00, date: '2026-07-10T12:00:00Z' },
  { id: '41', type: 'saida', categoryId: 'saude', description: 'Consulta Psiq', amount: 450.00, date: '2026-07-10T12:00:00Z' },
  { id: '42', type: 'saida', categoryId: 'transporte', description: 'Carro Oficina', amount: 650.00, date: '2026-07-10T12:00:00Z' },
  { id: '43', type: 'saida', categoryId: 'filhas', description: 'Guardar para Bia', amount: 253.00, date: '2026-07-10T12:00:00Z' },
];

const INITIAL_DEBTS: Debt[] = [
  { id: 'd1', userId: '', creditor: 'Detran RS (Fiesta) Placa ITF5718', description: 'Infração Bafômetro (Art. 165-A) - Vencida 12/01/2022', amount: 4003.51, status: 'atrasada', strategy: 'Prioridade: Verificar possibilidade de desconto de 40% no SNE (Carteira Digital de Trânsito).' },
  { id: 'd2', userId: '', creditor: 'Detran RS (Fiesta) Placa ITF5H18', description: 'IPVA 2026 (Pendente) - Venc. 30/04/2026', amount: 777.43, status: 'atrasada', strategy: 'Pagar para evitar bloqueio de licenciamento.' },
  { id: 'd3', userId: '', creditor: 'Detran RS (Fiesta) Placa ITF5H18', description: 'IPVA 2025 - Venc. 30/04/2025 (Em Dívida Ativa)', amount: 781.55, status: 'atrasada', strategy: 'Dívida Ativa. Fazer parcelamento na Sefaz/RS.' },
  { id: 'd4', userId: '', creditor: 'Detran RS (Fiesta) Placa ITF5H18', description: 'Taxa Licenciamento 2026 - Venc. 31/07/2026', amount: 114.09, status: 'atrasada', strategy: 'Pagar junto com o IPVA 2026.' },
  
  { id: 'd5', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'IPVA 2026 (Pendente) - Venc. 30/04/2026', amount: 343.92, status: 'atrasada', strategy: 'Regularizar IPVA do ano vigente.' },
  { id: 'd6', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'IPVA 2025 - Venc. 30/04/2025 (Em Dívida Ativa)', amount: 364.07, status: 'atrasada', strategy: 'Dívida Ativa. Fazer parcelamento na Sefaz/RS.' },
  { id: 'd7', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'IPVA 2024 - Venc. 28/06/2024 (Em Dívida Ativa)', amount: 387.35, status: 'atrasada', strategy: 'Dívida Ativa. Fazer parcelamento na Sefaz/RS.' },
  { id: 'd8', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'IPVA 2023 - Venc. 27/04/2023 (Em Dívida Ativa)', amount: 426.66, status: 'atrasada', strategy: 'Dívida Ativa. Fazer parcelamento na Sefaz/RS.' },
  { id: 'd9', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'IPVA 2022 - Venc. 28/04/2022 (Em Dívida Ativa)', amount: 452.18, status: 'atrasada', strategy: 'Dívida Ativa. Fazer parcelamento na Sefaz/RS.' },
  { id: 'd10', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'Taxa Licenciamento 2026 - Venc. 30/06/2026', amount: 114.09, status: 'atrasada', strategy: 'Pagar junto com o IPVA 2026.' },
  { id: 'd11', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'Infrações Vencidas (10)', amount: 7901.03, status: 'atrasada', strategy: 'Tentar renegociação, parcelamento pelo Detran ou pagamento com desconto no app CDT.' },
  { id: 'd12', userId: '', creditor: 'Detran RS (Peugeot) Placa IOU5857', description: 'Infração Aguardando Prazo Defesa (1)', amount: 293.47, status: 'em_negociacao', strategy: 'Acompanhar processo. Se indeferido, pagar com desconto de 20% ou 40%.' },

  { id: 'd13', userId: '', creditor: 'Anhanguera Educacional', description: 'Conta Atrasada', amount: 156.28, status: 'atrasada', strategy: 'Quitar no próximo mês para evitar bloqueio acadêmico.' },
  { id: 'd14', userId: '', creditor: 'Mercado Pago', description: 'Dívida Atrasada (CUPOM 78%) - De R$ 5.162,90', amount: 1135.84, status: 'em_negociacao', strategy: 'OPORTUNIDADE MASSIVA. Alta prioridade para quitar.' },
  { id: 'd15', userId: '', creditor: 'Nubank', description: 'Dívida Cartão', amount: 200.00, status: 'atrasada', strategy: 'Valor baixo, quitar assim que sobrar um pequeno valor no mês para limpar o nome.' },
  { id: 'd16', userId: '', creditor: 'Itaú', description: 'Dívida Cartão/Conta', amount: 500.00, status: 'atrasada', strategy: 'Ligar para negociar desconto à vista.' },
  { id: 'd17', userId: '', creditor: 'Empréstimo (Diversos)', description: '33x R$ 50,00', amount: 1650.00, status: 'atrasada', strategy: 'Tentar colocar em dia e manter pagamento mensal.' },
  
  { id: 'd18', userId: '', creditor: 'Empréstimo Consignado', description: '36x R$ 348,11 (Descontado em folha)', amount: 12531.96, status: 'descontado_folha', strategy: 'Dívida sob controle, descontada direto na folha.' },
  { id: 'd19', userId: '', creditor: 'Empréstimo Consignado', description: '36x R$ 387,81 (Descontado em folha)', amount: 13961.16, status: 'descontado_folha', strategy: 'Dívida sob controle, descontada direto na folha.' },
];

const INITIAL_GOALS: Omit<Goal, 'id'|'userId'>[] = [
  { title: 'Presente filha mais velha', targetAmount: 500.00, savedAmount: 0, deadline: '2026-08-21T00:00:00Z', description: 'Aniversário ou presente especial em agosto.' },
  { title: 'Operação filha mais velha (Parte 1)', targetAmount: 500.00, savedAmount: 0, deadline: '2026-10-31T00:00:00Z', description: 'Primeira parte da ajuda para a operação.' },
  { title: 'Operação filha mais velha (Parte 2)', targetAmount: 500.00, savedAmount: 0, deadline: '2026-12-15T00:00:00Z', description: 'Segunda parte da ajuda para a operação.' },
  { title: 'Checkup Carro (Viagem Porto Alegre)', targetAmount: 1000.00, savedAmount: 0, deadline: '2026-12-31T00:00:00Z', description: 'Revisão geral para viajar seguro (após quitar as dívidas principais).' },
  { title: 'Pensão Bia Direto na Folha', targetAmount: 600, savedAmount: 0, deadline: '2027-01-01T00:00:00Z', description: 'Meta: colocar 30% da pensão direto na folha após estabilizar finanças.' },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTransactions([]);
        setDebts([]);
        setGoals([]);
        setIsLoaded(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchAndSeed = async () => {
      // Force sync initial data (v3 - July 2026 update)
      if (typeof window !== 'undefined' && !localStorage.getItem('seeded_v3')) {
        localStorage.setItem('seeded_v3', 'true'); // set immediately to prevent duplicate runs
        Promise.all([
          ...INITIAL_TRANSACTIONS.map(t => setDoc(doc(db, "transactions", t.id), { ...t, userId: user.uid }, { merge: true })),
          ...INITIAL_DEBTS.map(d => setDoc(doc(db, "debts", d.id), { ...d, userId: user.uid }, { merge: true }))
        ]).catch(err => console.error("Error seeding v3 data:", err));
      }

      const transQ = query(collection(db, "transactions"), where("userId", "==", user.uid));
      const debtsQ = query(collection(db, "debts"), where("userId", "==", user.uid));
      const goalsQ = query(collection(db, "goals"), where("userId", "==", user.uid));

      const unsubTrans = onSnapshot(transQ, (snapshot) => {
        if (snapshot.empty) {
          // Fallback if not seeded
          Promise.all(INITIAL_TRANSACTIONS.map(t => setDoc(doc(db, "transactions", t.id), { ...t, userId: user.uid }))).catch(console.error);
        } else {
          const data: Transaction[] = [];
          snapshot.forEach((doc) => data.push(doc.data() as Transaction));
          data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(data);
        }
      });

      const unsubDebts = onSnapshot(debtsQ, (snapshot) => {
        if (snapshot.empty) {
          Promise.all(INITIAL_DEBTS.map(d => setDoc(doc(db, "debts", d.id), { ...d, userId: user.uid }))).catch(console.error);
        } else {
          const data: Debt[] = [];
          snapshot.forEach((doc) => data.push(doc.data() as Debt));
          data.sort((a, b) => b.amount - a.amount);
          setDebts(data);
        }
      });

      const unsubGoals = onSnapshot(goalsQ, (snapshot) => {
        if (snapshot.empty) {
          Promise.all(INITIAL_GOALS.map(g => {
             const id = Math.random().toString(36).substring(7);
             return setDoc(doc(db, "goals", id), { ...g, id, userId: user.uid });
          })).catch(console.error);
        } else {
          const data: Goal[] = [];
          snapshot.forEach((doc) => data.push(doc.data() as Goal));
          data.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
          setGoals(data);
        }
      });

      setIsLoaded(true);

      return () => {
        unsubTrans();
        unsubDebts();
        unsubGoals();
      };
    };

    const cleanup = fetchAndSeed();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [user]);

  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'date'> & { id?: string, date?: string }) => {
    if (!user) return;
    try {
      const id = newTransaction.id || Math.random().toString(36).substring(7);
      const transactionWithUser: Transaction & { userId: string } = { 
        ...newTransaction, 
        id,
        date: newTransaction.date || new Date().toISOString(),
        userId: user.uid 
      };
      await setDoc(doc(db, 'transactions', id), transactionWithUser);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const removeTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      console.error('Error removing transaction:', err);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'transactions', id), updates, { merge: true });
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  const generateStandardTransactions = async (year: number, month: number) => {
    if (!user) return;
    const date = new Date(Date.UTC(year, month - 1, 10, 12, 0, 0)).toISOString();
    
    const standards: (Omit<Transaction, 'id' | 'userId'> & { id: string })[] = [
      { id: Math.random().toString(36).substring(7), type: 'entrada', categoryId: 'salario', description: 'Salário Maicon', amount: 1500.00, date },
      { id: Math.random().toString(36).substring(7), type: 'entrada', categoryId: 'renda-extra', description: 'Salário Gabrielle', amount: 1600.00, date },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'filhas', description: 'Pensão Bia', amount: 600.00, date, tags: ['filhas'] },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'moradia', description: 'Cibele (Moradia)', amount: 320.00, date, tags: ['casa'] },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'moradia', description: 'Luz', amount: 300.00, date, tags: ['casa', 'essencial'] },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'telecom', description: 'Internet (OSIR)', amount: 116.00, date, tags: ['casa', 'assinaturas'] },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'telecom', description: 'Vivo', amount: 100.00, date, tags: ['assinaturas'] },
      { id: Math.random().toString(36).substring(7), type: 'saida', categoryId: 'educacao', description: 'Faculdade', amount: 160.00, date, tags: ['essencial'] }
    ];

    try {
      await Promise.all(standards.map(t => setDoc(doc(db, "transactions", t.id), { ...t, userId: user.uid })));
    } catch (err) {
      console.error('Error generating standard transactions:', err);
    }
  };

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Error signing in:', err);
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return {
    transactions,
    debts,
    goals,
    addTransaction,
    removeTransaction,
    updateTransaction,
    generateStandardTransactions,
    isLoaded,
    user,
    signIn,
    signOut: signOutUser
  };
}
