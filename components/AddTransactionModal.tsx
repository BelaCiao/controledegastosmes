import { useState } from "react";
import { Transaction } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface AddTransactionModalProps {
  onAdd: (t: Omit<Transaction, 'id' | 'date'> & { id?: string, date?: string }) => void;
}

export function AddTransactionModal({ onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<"entrada" | "saida">("saida");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("outros");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      type,
      categoryId,
      description,
      amount: Number(amount),
    });

    setDescription("");
    setAmount("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-black rounded-full p-4 shadow-lg font-bold text-2xl z-50 transition-transform active:scale-95"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Nova Transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                type === "entrada"
                  ? "bg-green-500 text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setType("entrada")}
            >
              Entrada
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${
                type === "saida"
                  ? "bg-red-500 text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              onClick={() => setType("saida")}
            >
              Saída
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Descrição
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              placeholder="Ex: Supermercado"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none"
            >
              {CATEGORIES.filter(
                (c) => c.type === type || c.type === "ambos"
              ).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-semibold text-black transition-colors ${
                type === "entrada"
                  ? "bg-green-500 hover:bg-green-400"
                  : "bg-red-500 hover:bg-red-400"
              }`}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
