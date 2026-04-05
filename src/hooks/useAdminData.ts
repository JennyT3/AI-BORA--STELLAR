import { useState, useEffect } from "react";
import { listProposals, updateProposal, deleteProposal, createCliente, listClientes, updateCliente, deleteCliente, listContactos, Contacto, delegarClienteAVendedor, listVendedoresAtivos, listTareas, createTarea, updateTarea, asignarTarea, aprobarTarea, marcarTareaPaga, getClienteByPropostaId } from "../services/firebase";
import { listSolicitudes, updateSolicitudeStatus, deleteSolicitude, asignarVendedorASolicitude } from "../services/solicitudes";
import { sendPropostaRespostaEmail } from "../services/emailService";
import { Proposal, Solicitude, Cliente, Tarea } from "../types";

interface UseAdminDataOptions {
  currentUserId?: string;
}

export function useAdminData({ currentUserId }: UseAdminDataOptions) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitude[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,
    respondidas: 0,
    aceitas: 0,
    reagendadas: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Proposal>>({});

  const [showFaturaModal, setShowFaturaModal] = useState(false);
  const [faturaData, setFaturaData] = useState<Proposal | null>(null);
  const [numeroFatura, setNumeroFatura] = useState("");

  const [showClienteForm, setShowClienteForm] = useState(false);
  const [clienteFormData, setClienteFormData] = useState<Partial<Cliente> | null>(null);
  const [clienteProposalData, setClienteProposalData] = useState<Proposal | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteFilterCategoria, setClienteFilterCategoria] = useState("todos");
  const [clienteFilterOrigem, setClienteFilterOrigem] = useState("todos");
  const [clienteFilterResposta, setClienteFilterResposta] = useState("todos");
  const [clienteSortBy, setClienteSortBy] = useState<"nome" | "createdAt" | "propostaValor">("createdAt");
  const [clienteSortOrder, setClienteSortOrder] = useState<"asc" | "desc">("desc");

  const loadStats = async () => {
    try {
      const data = await listProposals(500);
      setStats({
        total: data.length,
        enviadas: data.filter(p => p.dataEnvio).length,
        respondidas: data.filter(p => p.resposta).length,
        aceitas: data.filter(p => p.resposta === "sim").length,
        reagendadas: data.filter(p => p.resposta === "reagendar").length,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await listProposals(100);
      setProposals(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await listSolicitudes(100);
      setSolicitudes(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await listClientes(100);
      setClientes(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadContactos = async () => {
    try {
      const data = await listContactos(100);
      setContactos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVendedores = async () => {
    try {
      const data = await listVendedoresAtivos();
      setVendedores(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelegarVendedor = async (clienteId: string, vendedorId: string) => {
    try {
      await delegarClienteAVendedor(clienteId, vendedorId);
      loadClientes();
    } catch (err) {
      console.error(err);
      alert("Erro ao delegar cliente");
    }
  };

  const loadTareas = async () => {
    try {
      const data = await listTareas();
      setTareas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrearTarea = async (tareaData: Partial<Tarea>) => {
    try {
      await createTarea(tareaData);
      loadTareas();
      alert("Tarefa criada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar tarefa");
    }
  };

  const handleAsignarTarea = async (tareaId: string, vendedorId: string, prazo: string) => {
    try {
      await asignarTarea(tareaId, vendedorId, prazo);
      loadTareas();
    } catch (err) {
      console.error(err);
      alert("Erro ao atribuir tarefa");
    }
  };

  const handleAprobarEntrega = async (tareaId: string) => {
    try {
      await aprobarTarea(tareaId, 'admin');
      loadTareas();
    } catch (err) {
      console.error(err);
      alert("Erro ao aprobar entrega");
    }
  };

  const handleMarcarPaga = async (tareaId: string) => {
    try {
      await marcarTareaPaga(tareaId);
      loadTareas();
    } catch (err) {
      console.error(err);
      alert("Erro ao marcar como paga");
    }
  };

  const loadAll = () => {
    loadProposals();
    loadSolicitudes();
    loadClientes();
    loadContactos();
    loadVendedores();
    loadTareas();
    loadStats();
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    const p = proposals.find(p => p.id === id);
    if (p) setEditData(p);
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateProposal(id, {
        ...editData,
        atualizadoPor: currentUserId,
        atualizadoEm: new Date().toISOString(),
      });
      setEditingId(null);
      loadProposals();
      alert("Proposta atualizada!");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id: string, cliente: string) => {
    if (!confirm(`Eliminar proposta de ${cliente}?`)) return;
    try {
      await deleteProposal(id);
      loadProposals();
      alert("Proposta eliminada");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const handleMarcarEnviada = async (proposal: Proposal) => {
    const dataEnvio = prompt(
      "Data de envio (DD/MM/AAAA):",
      new Date().toLocaleDateString("pt-PT")
    );
    if (!dataEnvio) return;
    try {
      await updateProposal(proposal.id, { dataEnvio, enviadoPor: currentUserId });
      loadProposals();
    } catch (e) {
      alert("Erro: " + e);
    }
  };

  const handleRegistrarResposta = async (proposal: Proposal) => {
    const resposta = prompt("Resposta do cliente (sim/nao/reagendar):", proposal.resposta || "");
    if (!resposta || (resposta !== "sim" && resposta !== "nao" && resposta !== "reagendar")) {
      alert("Resposta deve ser 'sim', 'nao' ou 'reagendar'");
      return;
    }
    try {
      await updateProposal(proposal.id, {
        resposta: resposta.toLowerCase() as "sim" | "nao" | "reagendar",
        dataResposta: new Date().toISOString(),
        atualizadoPor: currentUserId,
      });

      // Enviar email automático de resposta
      if (proposal.email) {
        try {
          await sendPropostaRespostaEmail({
            nome: proposal.cliente,
            email: proposal.email,
            resposta: resposta.toLowerCase() as "sim" | "nao" | "reagendar",
            empresa: proposal.empresa,
          });
        } catch (emailErr) {
          console.error("Erro ao enviar email de resposta:", emailErr);
        }
      }
      
      const clienteVinculado = clientes.find(c => c.propostaId === proposal.id);
      if (clienteVinculado) {
        await updateCliente(clienteVinculado.id, {
          resposta: resposta.toLowerCase() as "sim" | "nao" | "reagendar",
          dataResposta: new Date().toISOString(),
          categoria: resposta === "sim" ? "cliente" : "sem_interesse",
        });
        loadClientes();
      }
      
      // Crear tareas automáticamente si proposta foi aceita
      if (resposta === "sim" && proposal.servicos && proposal.servicos.length > 0) {
        const cliente = await getClienteByPropostaId(proposal.id);
        if (cliente) {
          for (const servico of proposal.servicos) {
            await createTarea({
              titulo: `${servico} — ${proposal.cliente}`,
              clienteId: cliente.id,
              clienteNome: cliente.nome,
              propostaId: proposal.id,
              servicoNome: servico,
              estado: 'disponivel',
              recorrente: true,
              periodicidade: 'mensal',
              porcentagemColaborador: 30,
              porcentagemVendedor: 10,
            });
          }
          loadTareas();
        }
      }
      
      loadProposals();
    } catch (e) {
      alert("Erro: " + e);
    }
  };

  const handleCriarCliente = (
    proposal: Proposal,
    onNavigateClientes: () => void
  ) => {
    const existingByProposta = clientes.find(c => c.propostaId === proposal.id);
    const existingByContact = clientes.find(
      c =>
        (c.email && c.email.toLowerCase() === proposal.email?.toLowerCase()) ||
        (c.telemovel && c.telemovel === proposal.telefone)
    );

    if (existingByProposta) {
      alert(
        `Cliente já criado e vinculado a esta proposta: ${existingByProposta.nome}. Pode editá-lo na aba Clientes.`
      );
      setSelectedCliente(existingByProposta);
      onNavigateClientes();
      return;
    }

    if (existingByContact) {
      if (
        confirm(
          `Cliente "${existingByContact.nome}" já existe. Deseja vincular esta proposta a este cliente?`
        )
      ) {
        updateCliente(existingByContact.id, {
          propostaId: proposal.id,
          categoria:
            proposal.resposta === "sim"
              ? "cliente"
              : proposal.dataEnvio
              ? "proposta_enviada"
              : existingByContact.categoria,
        }).then(() => {
          loadClientes();
          alert("Cliente atualizado com sucesso!");
        });
      }
      return;
    }

    setClienteProposalData(proposal);
    setClienteFormData({
      nome: proposal.cliente || "",
      email: proposal.email || "",
      telemovel: proposal.telefone || "",
      nif: proposal.nif || "",
      morada: proposal.morada || "",
      categoria:
        proposal.resposta === "sim"
          ? "cliente"
          : proposal.dataEnvio
          ? "proposta_enviada"
          : "potencial",
      origem: "Website",
      criadoPor: currentUserId,
    });
    setShowClienteForm(true);
  };

  const handleCriarClienteFromSolicitude = (sol: any) => {
    setClienteFormData({
      nome: sol.nome || "",
      email: sol.email || "",
      telemovel: sol.telefone || "",
      nif: "",
      morada: "",
      empresa: sol.empresa || "",
      website: sol.website || "",
      categoria: "potencial",
      origem: sol.origem || "Website",
      observacoes: `Solicitação: ${sol.servicos?.join(", ")}`,
      solicitacaoId: sol.id,
      servicos: sol.servicos || [],
      criadoPor: currentUserId,
    });
    setShowClienteForm(true);
  };

  const handleSalvarCliente = async () => {
    try {
      await createCliente({ ...clienteFormData, criadoPor: currentUserId, origem: "Manual" });
      setShowClienteForm(false);
      setClienteFormData(null);
      setClienteSearch("");
      setShowClienteSuggestions(false);
      loadClientes();
      alert("Cliente criado com sucesso!");
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const handleVincularProposta = (c: Cliente) => {
    const proposta = proposals.find(
      p =>
        p.cliente?.toLowerCase().includes(c.nome?.toLowerCase()) ||
        p.email?.toLowerCase() === c.email?.toLowerCase() ||
        p.telefone === c.telemovel
    );
    if (proposta) {
      if (confirm(`Vincular a proposta?`)) {
        updateCliente(c.id, {
          propostaId: proposta.id,
        }).then(() => {
          loadClientes();
          alert("Proposta vinculada!");
        });
      }
    } else {
      alert("Nenhuma proposta encontrada para este cliente.");
    }
  };

  const handleEliminarCliente = (id: string) => {
    if (confirm("Eliminar cliente?")) {
      deleteCliente(id).then(() => loadClientes());
    }
  };

  const abrirFatura = (p: Proposal | Cliente) => {
    setFaturaData(p as Proposal);
    setNumeroFatura(`FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
    setShowFaturaModal(true);
  };

  const handleEliminarSolicitude = async (id: string) => {
    if (confirm("Eliminar solicitação?")) {
      await deleteSolicitude(id);
      loadSolicitudes();
    }
  };

  return {
    proposals,
    solicitudes,
    clientes,
    contactos,
    vendedores,
    tareas,
    loading,
    stats,
    editingId,
    editData,
    setEditData,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDelegarVendedor,
    handleMarcarEnviada,
    handleRegistrarResposta,
    cancelEdit: () => setEditingId(null),
    showFaturaModal,
    faturaData,
    numeroFatura,
    setNumeroFatura,
    abrirFatura,
    closeFaturaModal: () => setShowFaturaModal(false),
    showClienteForm,
    setShowClienteForm,
    clienteFormData,
    setClienteFormData,
    clienteSearch,
    setClienteSearch,
    showClienteSuggestions,
    setShowClienteSuggestions,
    handleCriarCliente,
    handleCriarClienteFromSolicitude,
    handleSalvarCliente,
    handleVincularProposta,
    handleEliminarCliente,
    closeClienteForm: () => {
      setShowClienteForm(false);
      setClienteFormData(null);
      setClienteSearch("");
      setShowClienteSuggestions(false);
    },
    selectedCliente,
    setSelectedCliente,
    clienteFilterCategoria,
    setClienteFilterCategoria,
    clienteFilterOrigem,
    setClienteFilterOrigem,
    clienteFilterResposta,
    setClienteFilterResposta,
    clienteSortBy,
    setClienteSortBy,
    clienteSortOrder,
    setClienteSortOrder,
    loadAll,
    loadProposals,
    loadSolicitudes,
    loadClientes,
    loadContactos,
    loadTareas,
    handleEliminarSolicitude,
    handleCrearTarea,
    handleAsignarTarea,
    handleAprobarEntrega,
    handleMarcarPaga,
  };
}