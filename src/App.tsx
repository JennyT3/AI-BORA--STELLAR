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
import { Analytics } from "@vercel/analytics/react";

import { useAuth } from "./hooks/useAuth";

function VendasApp() {
  const { vendedor, vendedorReady, login, logout } = useAuth();

  if (!vendedorReady) {
    return <div style={{ minHeight: "100vh" }} />;
  }

  if (!vendedor) {
    return <VendasLogin onLogin={(v) => login('vendedor', v)} />;
  }

  return <VendasDashboard vendedor={vendedor} onLogout={() => logout('vendedor')} />;
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