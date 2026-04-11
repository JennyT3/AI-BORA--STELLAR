import { Route, Switch } from "wouter";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./pages/Home";
import { Servicos } from "./pages/Servicos";
import { Orcamento } from "./pages/Orcamento";
import { PropostaPage } from "./pages/Proposta";
import ClienteLoginPage from "./pages/ClienteLogin";
import PagamentoPage from "./pages/Pagamento";
import { Admin } from "./pages/Admin";
import VerifyPage from "./pages/Verify";
import StellarPayPage from "./pages/StellarPay";
import RegisterPage from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import ClientePage from "./pages/Cliente";
import ColaboradorPage from "./pages/Colaborador";
import TareasPage from "./pages/Tareas";
import PaymentFlowPage from "./pages/PaymentFlow";
import AgentX402DemoPage from "./pages/AgentX402Demo";
import TestConnectionPage from "./pages/TestConnection";
import Academy from "./pages/academia/Academy";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/services" component={Servicos} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/quote" component={Orcamento} />
        <Route path="/orcamento" component={Orcamento} />
        <Route path="/admin/orcamento" component={Orcamento} />
        <Route path="/admin/orcamento" component={Orcamento} />
        <Route path="/proposal/:id" component={PropostaPage} />
        <Route path="/verify/:hash" component={VerifyPage} />
        <Route path="/client/login/:token" component={ClienteLoginPage} />
        <Route path="/client/login" component={ClienteLoginPage} />
        <Route path="/cliente/login/:token" component={ClienteLoginPage} />
        <Route path="/cliente/login" component={ClienteLoginPage} />
        <Route path="/client/:token" component={ClientePage} />
        <Route path="/cliente/:token" component={ClientePage} />
        <Route path="/client" component={ClientePage} />
        <Route path="/cliente" component={ClientePage} />
        <Route path="/tasks/:id" component={TareasPage} />
        <Route path="/tareas/:id" component={TareasPage} />
        <Route path="/payment/:id" component={PagamentoPage} />
        <Route path="/payment-flow/:id" component={PaymentFlowPage} />
        <Route path="/pagamento/:id" component={PagamentoPage} />
        <Route path="/stellar" component={StellarPayPage} />
        <Route path="/collaborator/:id" component={ColaboradorPage} />
        <Route path="/colaborador/:id" component={ColaboradorPage} />
        <Route path="/admin" component={Admin} />
        <Route path="/agent-x402-demo" component={AgentX402DemoPage} />
        <Route path="/test-connection" component={TestConnectionPage} />
        <Route path="/academy" component={Academy} />
        <Route>
          <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'#f8f7f4',fontFamily:'Montserrat,sans-serif'}}>
            <div style={{textAlign:'center'}}>
              <h1 style={{fontSize:72,fontWeight:900,color:'#1b1c1b',margin:0}}>404</h1>
              <p style={{fontSize:18,color:'#666',margin:'16px 0 32px'}}>Page not found</p>
              <a href="/" style={{color:'#F25C05',fontWeight:700,textDecoration:'none'}}>Back to home →</a>
            </div>
          </div>
        </Route>
      </Switch>
      <Analytics />
    </>
  );
}
