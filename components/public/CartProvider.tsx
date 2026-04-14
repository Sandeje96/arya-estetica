"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id:        string;   // instancia única en el carrito (serviceId o serviceId_N)
  serviceId: string;   // ID del servicio en DB
  name:      string;
  category:  string;
  price:     number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD";     item: CartItem }
  | { type: "REMOVE";  id: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

interface CartContextValue {
  items:    CartItem[];
  total:    number;
  count:    number;
  add:      (item: CartItem) => void;
  remove:   (id: string) => void;
  clear:    () => void;
  has:      (serviceId: string) => boolean;
  countOf:  (serviceId: string) => number;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD":
      // El ID de la instancia ya viene calculado desde afuera (único)
      if (state.items.some((i) => i.id === action.item.id)) return state;
      return { items: [...state.items, action.item] };
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      // Compatibilidad con items viejos sin serviceId
      return {
        items: action.items.map((i) => ({
          ...i,
          serviceId: i.serviceId ?? i.id,
        })),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "arya-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hidratar desde localStorage al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        if (Array.isArray(items) && items.length > 0) {
          dispatch({ type: "HYDRATE", items });
        }
      }
    } catch {
      // localStorage puede no estar disponible
    }
  }, []);

  // Persistir en localStorage cuando cambia el carrito
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // silencioso
    }
  }, [state.items]);

  const add    = useCallback((item: CartItem) => dispatch({ type: "ADD",    item }), []);
  const remove = useCallback((id: string)     => dispatch({ type: "REMOVE", id   }), []);
  const clear  = useCallback(()               => dispatch({ type: "CLEAR"        }), []);

  const has     = useCallback((serviceId: string) =>
    state.items.some((i) => i.serviceId === serviceId), [state.items]);
  const countOf = useCallback((serviceId: string) =>
    state.items.filter((i) => i.serviceId === serviceId).length, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, total, count: state.items.length, add, remove, clear, has, countOf }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
