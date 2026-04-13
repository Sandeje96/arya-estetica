"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  TrendingDown,
  Search,
  AlertTriangle,
} from "lucide-react";
import { formatPrice } from "@/lib/formatting";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ExpenseRow {
  id:          string;
  amount:      number;
  category:    string;
  description: string | null;
  date:        string;   // ISO
  dateLabel:   string;   // formateada para mostrar
}

const PRESET_CATEGORIES = [
  "alquiler", "insumos", "sueldos", "marketing",
  "servicios", "impuestos", "otros",
];

// ─── Schema ───────────────────────────────────────────────────────────────────

const expenseSchema = z.object({
  amount:      z.number().int().min(1, "Mayor a 0"),
  category:    z.string().min(1, "Elegí una categoría").max(60).trim(),
  description: z.string().max(500).trim().optional(),
  date:        z.string().min(1, "Elegí una fecha"),
});
type ExpenseValues = z.infer<typeof expenseSchema>;

// ─── Formulario inline ────────────────────────────────────────────────────────

function ExpenseForm({
  defaultValues,
  onSave,
  onCancel,
  submitLabel = "Guardar",
}: {
  defaultValues?: Partial<ExpenseValues>;
  onSave: (values: ExpenseValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState(
    defaultValues?.category && !PRESET_CATEGORIES.includes(defaultValues.category)
      ? defaultValues.category
      : ""
  );
  const [useCustom, setUseCustom] = useState(
    !!(defaultValues?.category && !PRESET_CATEGORIES.includes(defaultValues.category))
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseValues>({
    resolver:      zodResolver(expenseSchema),
    defaultValues: {
      ...defaultValues,
      date: defaultValues?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (values: ExpenseValues) => {
    setServerError(null);
    try {
      await onSave(values);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Monto */}
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Monto *</span>
          <input
            type="number"
            min={1}
            placeholder="15000"
            {...register("amount", { valueAsNumber: true })}
            className={cn(
              "px-3 py-2.5 rounded-lg border bg-arya-cream font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
              errors.amount ? "border-destructive" : "border-arya-gold/30"
            )}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </label>

        {/* Fecha */}
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Fecha *</span>
          <input
            type="date"
            {...register("date")}
            className={cn(
              "px-3 py-2.5 rounded-lg border bg-arya-cream font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
              errors.date ? "border-destructive" : "border-arya-gold/30"
            )}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </label>
      </div>

      {/* Categoría */}
      <label className="flex flex-col gap-1">
        <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Categoría *</span>
        {!useCustom ? (
          <div className="flex gap-2">
            <select
              {...register("category")}
              className={cn(
                "flex-1 px-3 py-2.5 rounded-lg border bg-arya-cream font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
                errors.category ? "border-destructive" : "border-arya-gold/30"
              )}
            >
              <option value="">Seleccionar…</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className="px-3 py-2 rounded-lg border border-arya-gold/30 text-arya-text-muted text-xs font-sans hover:bg-arya-gold/10 transition-colors whitespace-nowrap"
            >
              + Nueva
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                setValue("category", e.target.value, { shouldValidate: true });
              }}
              placeholder="Nombre de categoría…"
              className={cn(
                "flex-1 px-3 py-2.5 rounded-lg border bg-arya-cream font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30",
                errors.category ? "border-destructive" : "border-arya-gold/30"
              )}
            />
            <button
              type="button"
              onClick={() => { setUseCustom(false); setCustomCategory(""); setValue("category", ""); }}
              className="px-3 py-2 rounded-lg border border-arya-gold/30 text-arya-text-muted text-xs font-sans hover:bg-arya-gold/10 transition-colors"
            >
              Preset
            </button>
          </div>
        )}
        {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
      </label>

      {/* Descripción */}
      <label className="flex flex-col gap-1">
        <span className="font-sans text-xs text-arya-text-muted uppercase tracking-wider">Descripción (opcional)</span>
        <input
          type="text"
          placeholder="Ej: Alquiler local mayo"
          {...register("description")}
          className="px-3 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream font-sans text-sm focus:outline-none focus:ring-2 focus:ring-arya-green/30"
        />
      </label>

      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-sans" role="alert">
          <AlertTriangle size={13} className="shrink-0" aria-hidden />
          {serverError}
        </div>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-arya-gold/30 text-arya-text-muted font-sans text-sm hover:bg-arya-gold/10 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors disabled:opacity-60"
        >
          {isSubmitting
            ? <Loader2 size={14} className="animate-spin" aria-hidden />
            : <Check size={14} aria-hidden />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ─── Fila editable ────────────────────────────────────────────────────────────

function ExpenseRow({
  expense,
  onUpdated,
  onDeleted,
}: {
  expense: ExpenseRow;
  onUpdated: (e: ExpenseRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing]        = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (values: ExpenseValues) => {
    const res = await fetch(`/api/expenses/${expense.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...values, date: values.date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al guardar");
    onUpdated({
      ...expense,
      amount:      data.amount,
      category:    data.category,
      description: data.description,
      date:        data.date,
      dateLabel:   new Date(data.date).toLocaleDateString("es-AR", {
        day: "numeric", month: "short", year: "numeric",
      }),
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar este gasto?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(expense.id);
    });
  };

  if (editing) {
    return (
      <li className="px-4 py-4 bg-arya-cream/50">
        <ExpenseForm
          defaultValues={{
            amount:      expense.amount,
            category:    expense.category,
            description: expense.description ?? undefined,
            date:        expense.date.slice(0, 10),
          }}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
          submitLabel="Actualizar"
        />
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans text-sm font-medium text-arya-text">
            {formatPrice(expense.amount)}
          </span>
          <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-arya-gold/10 text-amber-700 border border-arya-gold/25 capitalize">
            {expense.category}
          </span>
        </div>
        {expense.description && (
          <p className="font-sans text-xs text-arya-text-muted mt-0.5 truncate">{expense.description}</p>
        )}
        <p className="font-sans text-[10px] text-arya-text-muted/60 mt-0.5">{expense.dateLabel}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-arya-text-muted/60 hover:text-arya-green-dark hover:bg-arya-green/10 transition-colors"
          title="Editar"
        >
          <Pencil size={13} aria-hidden />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-1.5 rounded-lg text-arya-text-muted/60 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          title="Eliminar"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Trash2 size={13} aria-hidden />}
        </button>
      </div>
    </li>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  expenses:     ExpenseRow[];
  totalMonth:   number;
  currentMonth: string; // "Abril 2026"
}

export function GastosClient({ expenses: initial, totalMonth, currentMonth }: Props) {
  const [expenses, setExpenses]   = useState(initial);
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [catFilter, setCatFilter] = useState<string>("todas");

  const handleCreated = async (values: ExpenseValues) => {
    const res = await fetch("/api/expenses", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...values, date: `${values.date}T12:00:00.000Z` }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al guardar");
    const newRow: ExpenseRow = {
      id:          data.id,
      amount:      data.amount,
      category:    data.category,
      description: data.description,
      date:        data.date,
      dateLabel:   new Date(data.date).toLocaleDateString("es-AR", {
        day: "numeric", month: "short", year: "numeric",
      }),
    };
    setExpenses((prev) => [newRow, ...prev]);
    setShowForm(false);
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const categories = ["todas", ...Array.from(new Set(expenses.map((e) => e.category))).sort()];

  const filtered = expenses.filter((e) => {
    const matchSearch =
      !search ||
      normalize(e.category).includes(normalize(search)) ||
      normalize(e.description ?? "").includes(normalize(search));
    const matchCat = catFilter === "todas" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-4">

      {/* Resumen del mes */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-arya-gold/20 bg-arya-cream-light">
        <div className="shrink-0 bg-arya-gold/10 text-arya-gold rounded-lg p-2.5">
          <TrendingDown size={20} aria-hidden />
        </div>
        <div>
          <p className="font-sans text-xs text-arya-text-muted">Total gastos · {currentMonth}</p>
          <p className="font-heading text-2xl font-light text-arya-green-dark">{formatPrice(totalMonth)}</p>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-arya-text-muted/50" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por categoría o descripción…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-arya-gold/30 bg-arya-cream-light font-sans text-sm text-arya-text placeholder:text-arya-text-muted/40 focus:outline-none focus:ring-2 focus:ring-arya-green/30"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-arya-green-dark text-arya-cream font-sans text-sm font-medium hover:bg-arya-green transition-colors shadow-sm shrink-0"
        >
          {showForm ? <X size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
          {showForm ? "Cancelar" : "Nuevo gasto"}
        </button>
      </div>

      {/* Formulario de nuevo gasto */}
      {showForm && (
        <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light p-4">
          <h3 className="font-heading text-lg font-light text-arya-green-dark mb-3">Registrar gasto</h3>
          <ExpenseForm onSave={handleCreated} onCancel={() => setShowForm(false)} submitLabel="Registrar" />
        </div>
      )}

      {/* Filtro por categoría */}
      {categories.length > 2 && (
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full border font-sans text-xs transition-colors capitalize",
                catFilter === cat
                  ? "bg-arya-green-dark text-arya-cream border-arya-green-dark"
                  : "border-arya-gold/30 text-arya-text-muted hover:border-arya-gold/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex items-center gap-3 px-4 py-5 rounded-xl border border-arya-gold/20 bg-arya-cream-light text-arya-text-muted">
          <TrendingDown size={16} className="text-arya-gold shrink-0" aria-hidden />
          <p className="font-sans text-sm">No hay gastos con ese filtro.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-arya-gold/20 bg-arya-cream-light overflow-hidden">
          <ul className="divide-y divide-arya-gold/10">
            {filtered.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onUpdated={(updated) =>
                  setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
                }
                onDeleted={(id) =>
                  setExpenses((prev) => prev.filter((e) => e.id !== id))
                }
              />
            ))}
          </ul>
          {(search || catFilter !== "todas") && (
            <div className="px-4 py-3 border-t border-arya-gold/10 flex justify-between items-center bg-arya-cream">
              <span className="font-sans text-xs text-arya-text-muted">Subtotal filtrado</span>
              <span className="font-heading text-lg font-light text-arya-green-dark">
                {formatPrice(filteredTotal)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
