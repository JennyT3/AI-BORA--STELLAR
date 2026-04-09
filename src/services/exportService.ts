export const exportToExcel = (proposals: any[] = [], solicitudes: any[] = [], clientes: any[] = [], vendedores: any[] = []) => {
  // Proposals
  const headerProposals = "Quote #,Client,Email,Phone,Value,Date,Created By,Status,Sent Date,Response\n";
  const csvProposals = proposals.map(p => {
    const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-PT') : '—';
    return `"${p.numeroOrcamento || ''}","${p.cliente || ''}","${p.email || ''}","${p.telefone || ''}",${p.valor || 0},"${date}","${p.criadoPor || ''}","${p.resposta || 'pendente'}","${p.dataEnvio || ''}","${p.resposta || ''}"`;
  }).join("\n");
  
  // Requests (solicitudes)
  const headerSolicitudes = "Name,Company,Email,Phone,Services,Date,Status\n";
  const csvSolicitudes = solicitudes.map(s => {
    const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-PT') : '—';
    return `"${s.nome || ''}","${s.empresa || ''}","${s.email || ''}","${s.telefone || ''}","${(s.servicos || []).join(', ')}","${date}","${s.status || 'pendente'}"`;
  }).join("\n");

  // Clients (CRM)
  const headerClientes = "Name,Email,Mobile,NIF,Company,Origin,Category,Address,Website,Vendedor ID,Created Date\n";
  const csvClientes = clientes.map(c => {
    const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-PT') : '—';
    return `"${c.nome || ''}","${c.email || ''}","${c.telemovel || ''}","${c.nif || ''}","${c.empresa || ''}","${c.origem || ''}","${c.categoria || ''}","${c.morada || ''}","${c.website || ''}","${c.vendedorId || ''}","${date}"`;
  }).join("\n");

  // Vendedores
  const headerVendedores = "Name,Email,Phone,Commission %,Active,Assigned Clients\n";
  const csvVendedores = vendedores.map(v => {
    return `"${v.nome || ''}","${v.email || ''}","${v.telefone || ''}",${v.comissaoPercent || 0},"${v.ativo ? 'YES' : 'NO'}","${(v.clientesIds || []).length}"`;
  }).join("\n");
  
  const csvContent = 
    "\ufeff=== CLIENTS (CRM) ===\n" + headerClientes + csvClientes + 
    "\n\n=== PROPOSALS ===\n" + headerProposals + csvProposals + 
    "\n\n=== REQUESTS ===\n" + headerSolicitudes + csvSolicitudes +
    "\n\n=== VENDEDORES ===\n" + headerVendedores + csvVendedores;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `AIBORA_Database_Export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
