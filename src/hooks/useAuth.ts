import { useState, useEffect } from 'react';
import { getVendedor, Vendedor } from '../services/vendedores';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "aibora2026";
export interface User { id: string; nome: string; role: "admin" | "user"; }
const USERS: User[] = [
  { id: "jenny", nome: "Jenny", role: "admin" },
  { id: "portugal", nome: "Portugal", role: "user" },
];

export function useAuth() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);
      // Check Admin
      const savedAdmin = localStorage.getItem("adminUser");
      if (savedAdmin) {
        const user = JSON.parse(savedAdmin);
        setCurrentUser(user);
        setAuthenticated(true);
      }

      // Check Vendedor (VendasApp logic)
      const params = new URLSearchParams(window.location.search);
      const adminMode = params.get("admin") === "true";
      const vendedorId = params.get("vendedor");
      const savedVendedor = localStorage.getItem("vendedorUser");

      if (adminMode && vendedorId) {
        try {
          const v = await getVendedor(vendedorId);
          if (v) {
            setVendedor(v);
            localStorage.setItem("vendedorUser", JSON.stringify(v));
          }
        } catch (err) {
          console.error("Erro ao carregar vendedor:", err);
        }
      } else if (savedVendedor) {
        setVendedor(JSON.parse(savedVendedor));
      }

      setLoading(false);
    };

    checkLogin();
  }, []);

  const login = (type: 'admin' | 'vendedor', data: any, password?: string) => {
    if (type === 'admin') {
      const user = USERS.find(u => u.id === data.toLowerCase());
      if (user && password === ADMIN_PASSWORD) {
        setAuthenticated(true);
        setCurrentUser(user);
        localStorage.setItem("adminUser", JSON.stringify(user));
        return { success: true };
      }
      return { success: false, error: "Utilizador ou password incorretos" };
    } else if (type === 'vendedor') {
      setVendedor(data);
      localStorage.setItem("vendedorUser", JSON.stringify(data));
      return { success: true };
    }
  };

  const logout = (type: 'admin' | 'vendedor') => {
    if (type === 'admin') {
      localStorage.removeItem("adminUser");
      setAuthenticated(false);
      setCurrentUser(null);
    } else {
      localStorage.removeItem("vendedorUser");
      setVendedor(null);
    }
  };

  return { vendedor, authenticated, currentUser, login, logout, loading };
}
