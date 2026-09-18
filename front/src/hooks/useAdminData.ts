import { useState } from "react";
import { listProposals, updateProposal, deleteProposal, createClient, listClients, updateClient, deleteClient, listContacts, Contact, delegateClientToSalesRep, listActiveSalesReps, listTasks, createTask, assignTask, approveTask, markTaskPaid, getClientByProposalId } from "../services/firebase";
import { listRequests, deleteRequest } from "../services/requests";
import { sendProposalResponseEmail, sendDeliveryApprovalEmail } from "../services/emailService";
import { Proposal, Request, Client, ClientStage, Task } from "../types";

interface UseAdminDataOptions {
  currentUserId?: string;
}

export function useAdminData({ currentUserId }: UseAdminDataOptions) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    respondidas: 0,
    aceitas: 0,
    reagendadas: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Proposal>>({});

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceDate, setInvoiceData] = useState<Proposal | null>(null);
  const [invoiceNumber, setNumberInvoice] = useState("");

  const [showClientForm, setShowClientForm] = useState(false);
  const [clientFormData, setClientFormData] = useState<Partial<Client> | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientFilterCategory, setClientFilterCategory] = useState("all");
  const [clientFilterSource, setClientFilterSource] = useState("all");
  const [clientFilterResponse, setClientFilterResponse] = useState("all");
  const [clientSortBy, setClientSortBy] = useState<"name" | "createdAt" | "propostaValor">("createdAt");
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">("desc");

  const loadStats = async () => {
    try {
      const data = await listProposals(500);
      setStats({
        total: data.length,
        sent: data.filter(p => p.sentAt).length,
        respondidas: data.filter(p => p.response).length,
        aceitas: data.filter(p => p.response === "yes").length,
        reagendadas: data.filter(p => p.response === "reschedule").length,
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

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await listRequests(100);
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await listClients(500);
      setClients(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadContacts = async () => {
    try {
      const data = await listContacts(100);
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSalesReps = async () => {
    try {
      const data = await listActiveSalesReps();
      setSalesReps(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelegateSalesRep = async (clientId: string, salesRepId: string) => {
    try {
      await delegateClientToSalesRep(clientId, salesRepId);
      loadClients();
    } catch (err) {
      console.error(err);
      alert("Failed to assign client to sales rep");
    }
  };

  const loadTasks = async () => {
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrearTask = async (taskData: Partial<Task>) => {
    try {
      await createTask(taskData);
      loadTasks();
      alert("Task created successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const handleAssignTask = async (taskId: string, salesRepId: string, prazo: string) => {
    try {
      const v = salesReps.find(v => v.id === salesRepId);
      await assignTask(taskId, salesRepId, v?.name || "Collaborator", prazo);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to assign task");
    }
  };

  const handleApproveDelivery = async (taskId: string) => {
    try {
      await approveTask(taskId);
      // Email client that admin approved the delivery
      const task = tasks.find(t => t.id === taskId);
      if (task?.clientEmail) {
        sendDeliveryApprovalEmail(
          task.clientEmail,
          task.clientName || '',
          task.title || task.serviceName || 'Service',
          new Date().toLocaleDateString('pt-PT')
        ).catch(() => {});
      }
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to approve delivery");
    }
  };

  const handleMarkPaid = async (taskId: string) => {
    try {
      await markTaskPaid(taskId);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as paid");
    }
  };

  const handleUpdateStage = async (clientId: string, stage: string) => {
    try {
      await updateClient(clientId, { stage: stage as ClientStage });
      loadClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTasks = async (clientId: string, tasks: any[]) => {
    try {
      await updateClient(clientId, { tasks: tasks });
      loadClients();
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = () => {
    loadProposals();
    loadRequests();
    loadClients();
    loadContacts();
    loadSalesReps();
    loadTasks();
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
        updatedBy: currentUserId,
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
      loadProposals();
      alert("Proposal updated.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string, client: string) => {
    if (!confirm(`Delete proposal for ${client}?`)) return;
    try {
      await deleteProposal(id);
      loadProposals();
      alert("Proposal deleted");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleMarkSent = async (proposal: Proposal) => {
    const sentAt = prompt(
      "Sent date (DD/MM/YYYY):",
      new Date().toLocaleDateString("pt-PT")
    );
    if (!sentAt) return;
    try {
      await updateProposal(proposal.id, { sentAt, sentBy: currentUserId });
      loadProposals();
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleRegistrarResponse = async (proposal: Proposal) => {
    const response = prompt("Client response (sim/nao/reagendar):", proposal.response || "");
    if (!response) return;
    // Accept both PT ("sim"/"nao"/"reagendar") and legacy EN ("yes"/"not"/"reschedule")
    const normalized = response.trim().toLowerCase();
    const map: Record<string, "yes" | "not" | "reschedule"> = {
      sim: "yes",
      nao: "not",
      "não": "not",
      reagendar: "reschedule",
      yes: "yes",
      not: "not",
      reschedule: "reschedule",
    };
    const value = map[normalized];
    if (!value) {
      alert("Resposta deve ser 'sim', 'nao', ou 'reagendar'");
      return;
    }
    try {
      await updateProposal(proposal.id, {
        response: value,
        responseDate: new Date().toISOString(),
        updatedBy: currentUserId,
      });

      // Send automatic response email
      if (proposal.email) {
        try {
          await sendProposalResponseEmail({
            name: proposal.client,
            email: proposal.email,
            response: value,
            company: proposal.company,
          });
        } catch (emailErr) {
          console.error("Failed to send response email:", emailErr);
        }
      }
      
      const clientLinked = clients.find(c => c.proposalId === proposal.id);
      if (clientLinked) {
        await updateClient(clientLinked.id, {
          response: value,
          responseDate: new Date().toISOString(),
          category: value === "yes" ? "client" : "not_interested",
        });
        loadClients();
      }

      // Create tasks automatically if the proposal was accepted
      if (value === "yes" && proposal.services && proposal.services.length > 0) {
        const client = await getClientByProposalId(proposal.id);
        if (client) {
          for (const service of proposal.services) {
            await createTask({
              title: `${service} — ${proposal.client}`,
              clientId: client.id,
              clientName: client.name,
              proposalId: proposal.id,
              serviceName: service,
              status: 'available',
              recurring: true,
              periodicidade: 'monthly',
              collaboratorPercentage: 30,
              salesRepPercentage: 10,
            });
          }
          loadTasks();
        }
      }
      
      loadProposals();
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleCreateClient = (
    proposal: Proposal,
    onNavigateClients: () => void
  ) => {
    const existingByProposal = clients.find(c => c.proposalId === proposal.id);
    const existingByContact = clients.find(
      c =>
        (c.email && c.email.toLowerCase() === proposal.email?.toLowerCase()) ||
        (c.mobile && c.mobile === proposal.phone)
    );

    if (existingByProposal) {
      alert(
        `Client already created and linked to this proposal: ${existingByProposal.name}. You can edit them in the Clients tab.`
      );
      setSelectedClient(existingByProposal);
      onNavigateClients();
      return;
    }

    if (existingByContact) {
      if (
        confirm(
          `Client "${existingByContact.name}" already exists. Link this proposal to this client?`
        )
      ) {
        updateClient(existingByContact.id, {
          proposalId: proposal.id,
          category:
            proposal.response === "yes"
              ? "client"
              : proposal.sentAt
              ? "proposal_sent"
              : existingByContact.category,
        }).then(() => {
          loadClients();
          alert("Client updated successfully.");
        });
      }
      return;
    }

    setClientFormData({
      name: proposal.client || "",
      email: proposal.email || "",
      mobile: proposal.phone || "",
      taxId: proposal.taxId || "",
      address: proposal.address || "",
      category:
        proposal.response === "yes"
          ? "client"
          : proposal.sentAt
          ? "proposal_sent"
          : "potential",
      source: "Website",
      createdBy: currentUserId,
    });
    setShowClientForm(true);
  };

  const handleCreateClientFromRequest = (sol: any) => {
    setClientFormData({
      name: sol.name || "",
      email: sol.email || "",
      mobile: sol.phone || "",
      taxId: "",
      address: "",
      company: sol.company || "",
      website: sol.website || "",
      category: "potential",
      source: sol.source || "Website",
      notes: `Request: ${sol.services?.join(", ")}`,
      requestId: sol.id,
      services: sol.services || [],
      createdBy: currentUserId,
    });
    setShowClientForm(true);
  };

  const handleSaveClient = async () => {
    try {
      await createClient({ ...clientFormData, createdBy: currentUserId, source: "Manual" });
      setShowClientForm(false);
      setClientFormData(null);
      setClientSearch("");
      setShowClientSuggestions(false);
      loadClients();
      alert("Client created successfully.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleLinkProposal = (c: Client) => {
    const proposal = proposals.find(
      p =>
        p.client?.toLowerCase().includes(c.name?.toLowerCase()) ||
        p.email?.toLowerCase() === c.email?.toLowerCase() ||
        p.phone === c.mobile
    );
    if (proposal) {
      if (confirm(`Link the proposal?`)) {
        updateClient(c.id, {
          proposalId: proposal.id,
        }).then(() => {
          loadClients();
          alert("Proposal linked.");
        });
      }
    } else {
      alert("No proposal found for this client.");
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Delete client?")) {
      deleteClient(id).then(() => loadClients());
    }
  };

  const openInvoice = (p: Proposal | Client) => {
    setInvoiceData(p as Proposal);
    setNumberInvoice(`FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
    setShowInvoiceModal(true);
  };

  const handleDeleteRequest = async (id: string) => {
    if (confirm("Delete request?")) {
      await deleteRequest(id);
      loadRequests();
    }
  };

  return {
    proposals,
    requests,
    clients,
    contacts,
    salesReps,
    tasks,
    loading,
    stats,
    editingId,
    editData,
    setEditData,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDelegateSalesRep,
    handleMarkSent,
    handleRegistrarResponse,
    cancelEdit: () => setEditingId(null),
    showInvoiceModal,
    invoiceDate,
    invoiceNumber,
    setNumberInvoice,
    openInvoice,
    closeInvoiceModal: () => setShowInvoiceModal(false),
    showClientForm,
    setShowClientForm,
    clientFormData,
    setClientFormData,
    clientSearch,
    setClientSearch,
    showClientSuggestions,
    setShowClientSuggestions,
    handleCreateClient,
    handleCreateClientFromRequest,
    handleSaveClient,
    handleLinkProposal,
    handleDeleteClient,
    closeClientForm: () => {
      setShowClientForm(false);
      setClientFormData(null);
      setClientSearch("");
      setShowClientSuggestions(false);
    },
    selectedClient,
    setSelectedClient,
    clientFilterCategory,
    setClientFilterCategory,
    clientFilterSource,
    setClientFilterSource,
    clientFilterResponse,
    setClientFilterResponse,
    clientSortBy,
    setClientSortBy,
    clientSortOrder,
    setClientSortOrder,
    loadAll,
    loadProposals,
    loadRequests,
    loadClients,
    loadContacts,
    loadTasks,
    handleDeleteRequest,
    handleCrearTask,
    handleAssignTask,
    handleApproveDelivery,
    handleMarkPaid,
    handleUpdateStage,
    handleUpdateTasks,
  };
}