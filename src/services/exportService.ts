export const exportToExcel = (proposals: any[], solicitudes: any[]) => {
  const csvProposals = "Nº Orçamento,Cliente,Email,Telefone,Valor,Data,Criado Por,Status,Data Envio,Resposta\n" + 
    proposals.map(p => `"${p.numeroOrcamento}","${p.cliente}","${p.email || ''}","${p.telefone || ''}",${p.valor || 0},"${new Date(p.createdAt).toLocaleDateString('pt-PT')}","${p.criadoPor || ''}","${p.resposta || 'pendente'}","${p.dataEnvio || ''}","${p.resposta || ''}"`).join("\n");
  
  const csvSolicitudes = "Nome,Empresa,Email,Telefone,Servicos,Data,Status\n" + 
    solicitudes.map(s => `"${s.nome}","${s.empresa || ''}","${s.email || ''}","${s.telefone || ''}","${(s.servicos || []).join(', ')}","${new Date(s.createdAt).toLocaleDateString('pt-PT')}","${s.status || 'pendente'}"`).join("\n");
  
  const csvContent = "=== PROPOSTAS ===\n" + csvProposals + "\n\n=== SOLICITAÇÕES ===\n" + csvSolicitudes;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `AIBORA_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
