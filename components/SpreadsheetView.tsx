import { useState } from "react";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { Plus, Trash2, Check } from "lucide-react";

interface SpreadsheetViewProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id' | 'date'> & { id?: string, date?: string }) => void;
  onUpdate?: (id: string, updates: Partial<Transaction>) => void;
  onRemove?: (id: string) => void;
}

export function SpreadsheetView({ transactions, onAdd, onUpdate, onRemove }: SpreadsheetViewProps) {
  const [addingRow, setAddingRow] = useState(false);
  const [newType, setNewType] = useState<"entrada" | "saida">("saida");
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [editingCell, setEditingCell] = useState<{ id: string, field: 'description' | 'amount' } | null>(null);

  const handleInlineAdd = () => {
    if (!newDesc || !newAmount || isNaN(Number(newAmount))) return;
    
    onAdd({
      type: newType,
      categoryId: "outros",
      description: newDesc,
      amount: Number(newAmount),
      date: new Date(newDate).toISOString(),
    });
    
    setNewDesc("");
    setNewAmount("");
    setAddingRow(false);
  };
  
  const entradas = transactions
    .filter((t) => t.type === "entrada")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const saidas = transactions
    .filter((t) => t.type === "saida")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const allDates = Array.from(new Set(transactions.map((t) => format(new Date(t.date), "yyyy-MM-dd")))).sort();

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-900 border-b-2 border-zinc-700 text-xs text-zinc-400 uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold border-r border-zinc-800 w-[120px]">Data</th>
              <th className="px-4 py-3 font-semibold border-r border-zinc-800 text-green-400" colSpan={2}>
                Entradas (R$)
              </th>
              <th className="px-4 py-3 font-semibold border-r border-zinc-800 text-red-400" colSpan={2}>
                Saídas (R$)
              </th>
              <th className="px-4 py-3 font-semibold w-[120px]">Saldo Dia</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {allDates.map((dateString) => {
              const dateTrans = transactions.filter(t => format(new Date(t.date), "yyyy-MM-dd") === dateString);
              const dayEntradas = dateTrans.filter(t => t.type === "entrada");
              const daySaidas = dateTrans.filter(t => t.type === "saida");
              const maxRows = Math.max(dayEntradas.length, daySaidas.length) || 1;
              const totalEntradasDia = dayEntradas.reduce((acc, curr) => acc + curr.amount, 0);
              const totalSaidasDia = daySaidas.reduce((acc, curr) => acc + curr.amount, 0);
              const saldoDia = totalEntradasDia - totalSaidasDia;

              return Array.from({ length: maxRows }).map((_, idx) => {
                const entrada = dayEntradas[idx];
                const saida = daySaidas[idx];
                return (
                  <tr key={`${dateString}-${idx}`} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-4 py-2 border-r border-zinc-800/50 text-zinc-500 whitespace-nowrap">
                      {idx === 0 ? format(new Date(dateString), "dd/MM/yyyy") : ""}
                    </td>
                    
                    {/* ENTRADAS */}
                    <td className="px-4 py-2 border-r border-zinc-800/50 bg-green-500/5 text-zinc-300 w-[30%] group" onClick={() => entrada && setEditingCell({ id: entrada.id, field: 'description' })}>
                      {entrada ? (
                        editingCell?.id === entrada.id && editingCell.field === 'description' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              defaultValue={entrada.description}
                              onBlur={(e) => {
                                if (onUpdate && e.target.value !== entrada.description) onUpdate(entrada.id, { description: e.target.value });
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (onUpdate && e.currentTarget.value !== entrada.description) onUpdate(entrada.id, { description: e.currentTarget.value });
                                  setEditingCell(null);
                                } else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="bg-transparent border-b border-green-500 outline-none w-full text-zinc-200"
                            />
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="cursor-pointer hover:text-white transition-colors block">{entrada.description}</span>
                              {entrada.tags && entrada.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {entrada.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-sm">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(entrada.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-400 transition-opacity"
                              title="Apagar Linha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : ""}
                    </td>
                    <td className="px-4 py-2 border-r border-zinc-800/50 bg-green-500/5 text-green-400 font-medium text-right w-[15%]" onClick={() => entrada && setEditingCell({ id: entrada.id, field: 'amount' })}>
                      {entrada ? (
                        editingCell?.id === entrada.id && editingCell.field === 'amount' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              defaultValue={entrada.amount}
                              onBlur={(e) => {
                                if (onUpdate && Number(e.target.value) !== entrada.amount) onUpdate(entrada.id, { amount: Number(e.target.value) });
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (onUpdate && Number(e.currentTarget.value) !== entrada.amount) onUpdate(entrada.id, { amount: Number(e.currentTarget.value) });
                                  setEditingCell(null);
                                } else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="bg-transparent border-b border-green-500 outline-none w-full text-right text-green-400"
                            />
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                          </div>
                         ) : (
                           <span className="cursor-pointer hover:text-green-300 transition-colors block">R$ {entrada.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                         )
                      ) : ""}
                    </td>

                    {/* SAIDAS */}
                    <td className="px-4 py-2 border-r border-zinc-800/50 bg-red-500/5 text-zinc-300 w-[30%] group" onClick={() => saida && setEditingCell({ id: saida.id, field: 'description' })}>
                      {saida ? (
                        editingCell?.id === saida.id && editingCell.field === 'description' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              autoFocus
                              defaultValue={saida.description}
                              onBlur={(e) => {
                                if (onUpdate && e.target.value !== saida.description) onUpdate(saida.id, { description: e.target.value });
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (onUpdate && e.currentTarget.value !== saida.description) onUpdate(saida.id, { description: e.currentTarget.value });
                                  setEditingCell(null);
                                } else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="bg-transparent border-b border-red-500 outline-none w-full text-zinc-200"
                            />
                            <Check className="w-4 h-4 text-red-500 shrink-0" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="cursor-pointer hover:text-white transition-colors block">{saida.description}</span>
                              {saida.tags && saida.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {saida.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-sm">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(saida.id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-400 transition-opacity"
                              title="Apagar Linha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : ""}
                    </td>
                    <td className="px-4 py-2 border-r border-zinc-800/50 bg-red-500/5 text-zinc-400 text-right w-[15%]" onClick={() => saida && setEditingCell({ id: saida.id, field: 'amount' })}>
                      {saida ? (
                         editingCell?.id === saida.id && editingCell.field === 'amount' ? (
                          <div className="flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              defaultValue={saida.amount}
                              onBlur={(e) => {
                                if (onUpdate && Number(e.target.value) !== saida.amount) onUpdate(saida.id, { amount: Number(e.target.value) });
                                setEditingCell(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (onUpdate && Number(e.currentTarget.value) !== saida.amount) onUpdate(saida.id, { amount: Number(e.currentTarget.value) });
                                  setEditingCell(null);
                                } else if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="bg-transparent border-b border-red-500 outline-none w-full text-right text-red-400"
                            />
                            <Check className="w-4 h-4 text-red-500 shrink-0" />
                          </div>
                         ) : (
                           <span className="cursor-pointer hover:text-red-300 transition-colors block">R$ {saida.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                         )
                      ) : ""}
                    </td>

                    {/* SALDO DIA */}
                    <td className={`px-4 py-2 text-right font-medium ${saldoDia >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {idx === 0 ? `R$ ${saldoDia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}
                    </td>
                  </tr>
                );
              });
            })}
            
            {/* Nova Linha Editable */}
            {addingRow ? (
              <tr className="bg-zinc-800/30 border-b border-zinc-700">
                <td className="px-2 py-2 border-r border-zinc-800/50">
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" 
                  />
                </td>
                <td colSpan={2} className={`px-2 py-2 border-r border-zinc-800/50 ${newType === 'entrada' ? 'bg-zinc-900/50' : 'opacity-30'}`}>
                  {newType === 'entrada' && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Descrição Renda" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" />
                      <input type="number" placeholder="Valor" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" />
                    </div>
                  )}
                </td>
                <td colSpan={2} className={`px-2 py-2 border-r border-zinc-800/50 ${newType === 'saida' ? 'bg-zinc-900/50' : 'opacity-30'}`}>
                  {newType === 'saida' && (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Descrição Conta" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" />
                      <input type="number" placeholder="Valor" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs" />
                    </div>
                  )}
                </td>
                <td className="px-2 py-2 flex items-center justify-between">
                  <select value={newType} onChange={e => setNewType(e.target.value as any)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs mr-2">
                    <option value="saida">Saída</option>
                    <option value="entrada">Entrada</option>
                  </select>
                  <div className="flex gap-1">
                    <button onClick={handleInlineAdd} className="bg-green-600/20 text-green-400 hover:bg-green-600/40 px-3 py-1 rounded text-xs font-bold">Salvar</button>
                    <button onClick={() => setAddingRow(false)} className="bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-3 py-1 rounded text-xs">X</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="border-b border-zinc-800 hover:bg-zinc-800/20 cursor-pointer transition-colors" onClick={() => setAddingRow(true)}>
                <td colSpan={6} className="px-4 py-3 text-center text-zinc-500 font-semibold text-xs flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Adicionar nova linha
                </td>
              </tr>
            )}

            {/* Linha de Totais */}
            <tr className="bg-zinc-900 border-t-2 border-zinc-700 text-sm font-bold uppercase tracking-wider">
              <td className="px-4 py-4 border-r border-zinc-800 text-zinc-300">
                TOTAL
              </td>
              <td colSpan={2} className="px-4 py-4 border-r border-zinc-800 text-right text-green-400">
                R$ {entradas.reduce((a, b) => a + b.amount, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
              <td colSpan={2} className="px-4 py-4 border-r border-zinc-800 text-right text-red-400">
                R$ {saidas.reduce((a, b) => a + b.amount, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-4 text-right text-white">
                R$ {(entradas.reduce((a, b) => a + b.amount, 0) - saidas.reduce((a, b) => a + b.amount, 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
