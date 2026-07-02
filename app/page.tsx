"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { Wallet, TrendingUp, TrendingDown, LayoutList, Table2, AlertTriangle, ArrowRight, CheckCircle2, Clock, Target, ChevronLeft, ChevronRight, Wand2, Calculator as CalculatorIcon, PieChart as PieChartIcon } from "lucide-react";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { TransactionList } from "@/components/TransactionList";
import { SpreadsheetView } from "@/components/SpreadsheetView";
import { DebtsAndGoals } from "@/components/DebtsAndGoals";
import { Calculator } from "@/components/Calculator";
import { ConsumptionAnalysis } from "@/components/ConsumptionAnalysis";
import * as Tabs from "@radix-ui/react-tabs";

export default function Home() {
  const {
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
    signOut,
  } = useTransactions();

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(7); // Julho
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark)] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Wallet className="w-12 h-12 text-zinc-600" />
          <p className="text-zinc-500 font-medium">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-dark)] text-zinc-100 p-8">
        <div className="max-w-md w-full bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Controle de Gastos</h1>
            <p className="text-zinc-400 text-sm">Faça login para gerenciar suas finanças e ter seus dados sincronizados na nuvem de forma segura.</p>
          </div>
          <button
            onClick={signIn}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getUTCFullYear() === selectedYear && (d.getUTCMonth() + 1) === selectedMonth;
  });

  const saldo = filteredTransactions.reduce((acc, curr) => {
    return curr.type === "entrada" ? acc + curr.amount : acc - curr.amount;
  }, 0);

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSaidas = filteredTransactions
    .filter((t) => t.type === "saida")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const years = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i);
  const months = [
    { value: 1, label: 'Jan' }, { value: 2, label: 'Fev' }, { value: 3, label: 'Mar' },
    { value: 4, label: 'Abr' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' }, { value: 8, label: 'Ago' }, { value: 9, label: 'Set' },
    { value: 10, label: 'Out' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dez' }
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const monthLabel = months.find(m => m.value === selectedMonth)?.label;

  return (
    <main className="min-h-screen bg-[var(--color-dark)] text-zinc-100 flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 sm:px-8 py-8 space-y-8 pb-24">
        {/* YEAR/MONTH SELECTOR */}
        <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-xl font-bold tracking-tight text-white flex gap-2 items-center">
            <span className="text-zinc-400">{monthLabel}</span>
            <span>{selectedYear}</span>
          </div>

          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="bg-zinc-900/40 border border-dashed border-zinc-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
            <Wand2 className="w-8 h-8 text-zinc-500" />
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Mês vazio</h2>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">Não há lançamentos para este mês. Deseja preencher com os valores padrões (Salários Maicon/Gabrielle, Moradia, Luz, Internet, Vivo, Faculdade, Pensão)?</p>
            </div>
            <button
              onClick={() => generateStandardTransactions(selectedYear, selectedMonth)}
              className="px-6 py-3 bg-zinc-100 hover:bg-white text-black font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Preencher Contas Padrão
            </button>
          </div>
        )}

        {/* HEADER */}
        <header className="flex flex-col md:flex-row gap-6 md:items-start justify-between bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/80 shadow-2xl">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between w-full text-zinc-400 mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="font-semibold tracking-widest uppercase text-sm">
                  Dashboard Financeiro
                </span>
              </div>
              <button 
                onClick={signOut}
                className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors font-medium text-zinc-300"
              >
                Sair
              </button>
            </div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-4">
              Saldo do Mês
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white flex items-center gap-2 mt-2">
              <span className="text-zinc-600 font-normal text-3xl">R$</span>
              {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h1>
          </div>

          <div className="flex gap-4 md:items-end h-full mt-4 md:mt-0">
            <div className="bg-gradient-to-br from-[#1b211a] to-[#0e110e] border border-[#2e3b2e] p-5 rounded-2xl flex-1 md:min-w-[200px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#a7b8a7] uppercase tracking-widest">
                  Receitas
                </span>
                <TrendingUp className="w-4 h-4 text-[#8ec88e]" />
              </div>
              <div className="text-2xl font-bold text-[#b4deb4]">
                R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#2a1b1b] to-[#140d0d] border border-[#3d2424] p-5 rounded-2xl flex-1 md:min-w-[200px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#c29696] uppercase tracking-widest">
                  Despesas
                </span>
                <TrendingDown className="w-4 h-4 text-[#e38d8d]" />
              </div>
              <div className="text-2xl font-bold text-[#e8b5b5]">
                R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </header>

        {/* TABS */}
        <Tabs.Root defaultValue="planilha" className="w-full">
          <Tabs.List className="flex overflow-x-auto no-scrollbar gap-2 mb-6">
            <Tabs.Trigger
              value="lista"
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:border-zinc-700 border border-transparent transition-all"
            >
              <LayoutList className="w-4 h-4" />
              Lista
            </Tabs.Trigger>
            <Tabs.Trigger
              value="planilha"
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white data-[state=active]:border-zinc-700 border border-transparent transition-all"
            >
              <Table2 className="w-4 h-4" />
              Planilha
            </Tabs.Trigger>
            <Tabs.Trigger
              value="dividas-metas"
              className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-900/50 border border-transparent transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Dívidas & Metas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="calculadora"
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 data-[state=active]:bg-indigo-900/20 data-[state=active]:text-indigo-400 data-[state=active]:border-indigo-900/50 border border-transparent transition-all"
            >
              <CalculatorIcon className="w-4 h-4" />
              Calculadora
            </Tabs.Trigger>
            <Tabs.Trigger
              value="analise"
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 data-[state=active]:bg-pink-900/20 data-[state=active]:text-pink-400 data-[state=active]:border-pink-900/50 border border-transparent transition-all"
            >
              <PieChartIcon className="w-4 h-4" />
              Análise
            </Tabs.Trigger>
          </Tabs.List>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 min-h-[400px]">
            <Tabs.Content value="lista" className="focus:outline-none">
              <TransactionList
                transactions={filteredTransactions}
                onRemove={removeTransaction}
              />
            </Tabs.Content>

            <Tabs.Content value="planilha" className="focus:outline-none overflow-x-auto">
              <SpreadsheetView
                transactions={filteredTransactions}
                onAdd={addTransaction}
                onUpdate={updateTransaction}
                onRemove={removeTransaction}
              />
            </Tabs.Content>
            
            <Tabs.Content value="dividas-metas" className="focus:outline-none">
              <DebtsAndGoals debts={debts} goals={goals} />
            </Tabs.Content>

            <Tabs.Content value="calculadora" className="focus:outline-none flex justify-center py-8">
              <Calculator />
            </Tabs.Content>

            <Tabs.Content value="analise" className="focus:outline-none py-8">
              <ConsumptionAnalysis transactions={filteredTransactions} />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>

      <AddTransactionModal onAdd={addTransaction} />
    </main>
  );
}
