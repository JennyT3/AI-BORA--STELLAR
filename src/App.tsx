import { Route, Switch } from "wouter";
import { Home } from "./pages/Home";
import { Servicos } from "./pages/Servicos";
import { Packs } from "./pages/Packs";
import { Prompts } from "./pages/Prompts";
import { Privacidade } from "./pages/Privacidade";
import { Termos } from "./pages/Termos";
import { Orcamento } from "./pages/Orcamento";
import { PropostaPage } from "./pages/Proposta";
import { ClienteFicha } from "./pages/ClienteFicha";
import ClienteLoginPage from "./pages/ClienteLogin";
import PagamentoPage from "./pages/Pagamento";
import { Admin } from "./pages/Admin";
import { VendasLogin } from "./pages/VendasLogin";
import { VendasDashboard } from "./pages/VendasDashboard";
import Academia from "./pages/academia";
import AcademiaLogin from "./pages/academia/login";
import AcademiaDashboard from "./pages/academia/dashboard";
import AcademiaOnboarding from "./pages/academia/onboarding";
import AcademiaPerfil from "./pages/academia/perfil";
import AcademiaAula from "./pages/academia/aula";
import AcademiaTrilha from "./pages/academia/trilha";
import AcademiaTrilhas from "./pages/academia/trilhas";
import AcademiaCertificados from "./pages/academia/certificados";
import AcademiaVerificar from "./pages/academia/verificar";
import AcademiaComunidade from "./pages/academia/comunidade";
import AcademiaConsultoria from "./pages/academia/consultoria";
import AcademiaQuiz from "./pages/academia/quiz";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "./hooks/useAuth";
import VerifyPage from "./pages/Verify";
import StellarPayPage from "./pages/StellarPay";
import RegisterPage from "./pages/Register";
import SelectionPage from "./pages/Selection";
import ClientePage from "./pages/Cliente";
import ColaboradorPage from "./pages/Colaborador";
import TareasPage from "./pages/Tareas";

function VendasApp() {
  const { vendedor, vendedorReady, login, logout } = useAuth();
  if (!vendedorReady) return <div style={{ minHeight: "100vh" }} />;
  if (!vendedor) return <VendasLogin onLogin={(v) => login('vendedor', v)} />;
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
        <Route path="/proposal/:id" component={PropostaPage} />
        <Route path="/c/:id" component={ClienteFicha} />
        <Route path="/cliente/login/:token" component={ClienteLoginPage} />
        <Route path="/cliente/login" component={ClienteLoginPage} />
        <Route path="/pagamento/:id" component={PagamentoPage} />
        <Route path="/tareas/:id" component={TareasPage} />
        <Route path="/verify/:hash" component={VerifyPage} />
        <Route path="/stellar" component={StellarPayPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/selection" component={SelectionPage} />
        <Route path="/cliente" component={ClientePage} />
        <Route path="/cliente/:token" component={ClientePage} />
        <Route path="/colaborador/:id" component={ColaboradorPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/vendas" component={VendasApp} />

        <Route path="/academia" component={Academia} />
        <Route path="/academia/login" component={AcademiaLogin} />
        <Route path="/academia/dashboard" component={AcademiaDashboard} />
        <Route path="/academia/onboarding" component={AcademiaOnboarding} />
        <Route path="/academia/perfil" component={AcademiaPerfil} />
        <Route path="/academia/aula/:id" component={AcademiaAula} />
        <Route path="/academia/trilha/:id" component={AcademiaTrilha} />
        <Route path="/academia/trilhas" component={AcademiaTrilhas} />
        <Route path="/academia/certificados" component={AcademiaCertificados} />
        <Route path="/academia/verificar/:codigo" component={AcademiaVerificar} />
        <Route path="/academia/comunidade" component={AcademiaComunidade} />
        <Route path="/academia/consultoria" component={AcademiaConsultoria} />
        <Route path="/academia/quiz/:trilhaId" component={AcademiaQuiz} />

        <Route>
          <div className="min-h-screen bg-bg flex items-center justify-center text-text-primary">
            <div className="text-center">
              <h1 className="font-display font-bold text-6xl mb-4">404</h1>
              <p className="text-xl text-text-secondary mb-8">Page not found</p>
              <a href="/" className="text-fuchsia-brand hover:underline font-bold">Back to home</a>
            </div>
          </div>
        </Route>
      </Switch>
      <Analytics />
    </>
  );
}
