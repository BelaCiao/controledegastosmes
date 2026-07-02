"use client";

import { Transaction } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ConsumptionAnalysisProps {
  transactions: Transaction[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'];

export function ConsumptionAnalysis({ transactions }: ConsumptionAnalysisProps) {
  const saidas = transactions.filter((t) => t.type === "saida");
  
  // Agrupar por tags
  const tagTotals: Record<string, number> = {};
  
  saidas.forEach(saida => {
    if (saida.tags && saida.tags.length > 0) {
      saida.tags.forEach(tag => {
        tagTotals[tag] = (tagTotals[tag] || 0) + saida.amount;
      });
    } else {
      tagTotals["sem_tag"] = (tagTotals["sem_tag"] || 0) + saida.amount;
    }
  });

  const chartData = Object.keys(tagTotals).map((tag, idx) => ({
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    value: tagTotals[tag],
    color: COLORS[idx % COLORS.length]
  })).sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return <div className="text-zinc-500 text-center py-10">Nenhum dado para análise.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
      <div className="w-full md:w-1/2 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
              <Tooltip 
                formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-full md:w-1/2">
        <h3 className="text-lg font-semibold text-white mb-4">Resumo de Consumo (Tags)</h3>
        <div className="space-y-3">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-300 font-medium">{item.name}</span>
              </div>
              <span className="text-white font-semibold">
                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
