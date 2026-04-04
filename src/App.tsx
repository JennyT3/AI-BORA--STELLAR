import { Route, Switch } from "wouter";
import { Home } from "./pages/Home";
import { Servicos } from "./pages/Servicos";
import { Packs } from "./pages/Packs";
import { Prompts } from "./pages/Prompts";
import { Privacidade } from "./pages/Privacidade";
import { Termos } from "./pages/Termos";
import { Orcamento } from "./pages/Orcamento";
import { PropostaPage } from "./pages/Proposta";
import { Admin } from "./pages/Admin";
import { VendasLogin } from "./pages/VendasLogin";
import { VendasDashboard } from "./pages/VendasDashboard";
import { useState, useEffect } from "react";
import { getVendedor, Vendedor } from "./services/vendedores";
import { Analytics } from "@vercel/analytics/react";

function VendasApp() {
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminMode = params.get("admin") === "true";
    const vendedorId = params.get("vendedor");

    const checkLogin = async () => {
      const savedVendedor = localStorage.getItem("vendedorUser");
      
      // Si es admin y viene con vendedor específico, cargar ese vendedor
      if (adminMode && vendedorId) {
        try {
          const v = await getVendedor(vendedorId);
          if (v) {
            setVendedor(v);
            localStorage.setItem("vendedorUser", JSON.stringify(v));
          }
        } catch (err) {
          console.error(err);
        }
      } else if (savedVendedor) {
        setVendedor(JSON.parse(savedVendedor));
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  const handleLogin = (vendedorLogado: Vendedor) => {
    setVendedor(vendedorLogado);
  };

  const handleLogout = () => {
    localStorage.removeItem("vendedorUser");
    setVendedor(null);
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>A carregar...</div>;
  }

  if (!vendedor) {
    return <VendasLogin onLogin={handleLogin} />;
  }

  return <VendasDashboard vendedor={vendedor} onLogout={handleLogout} />;
}

export default function App() {
  return (
    <>
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/servicos" component={Servicos} />
      <Route path="/packs" component={Packs} />
      <Route path="/prompts" component={Prompts} />
      <Route path="/privacidade" component={Privacidade} />
      <Route path="/termos" component={Termos} />
      <Route path="/orcamento" component={Orcamento} />
      <Route path="/admin/orcamento" component={Orcamento} />
      <Route path="/p/:id" component={PropostaPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/vendas" component={VendasApp} />
      <Route>
        <div className="min-h-screen bg-bg flex items-center justify-center text-text-primary">
          <div className="text-center">
            <h1 className="font-display font-bold text-6xl mb-4">404</h1>
            <p className="text-xl text-text-secondary mb-8">Página não encontrada</p>
            <a href="/" className="text-fuchsia-brand hover:underline font-bold">Voltar à página inicial</a>
          </div>
        </div>
      </Route>
    </Switch>
    <Analytics />
    </>
  );
}