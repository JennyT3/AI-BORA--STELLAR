import { Route, Switch } from "wouter";
import { Home } from "./pages/Home";
import { Servicos } from "./pages/Servicos";
import { Privacidade } from "./pages/Privacidade";
import { Termos } from "./pages/Termos";
import { Labs } from "./pages/Labs";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/servicos" component={Servicos} />
      <Route path="/labs" component={Labs} />
      <Route path="/privacidade" component={Privacidade} />
      <Route path="/termos" component={Termos} />
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
  );
}
