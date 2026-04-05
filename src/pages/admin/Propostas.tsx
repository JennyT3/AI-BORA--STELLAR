import { getStatusColor, getStatusLabel } from "../../utils/labels";

interface PropostasProps {
  proposals: any[];
  loading: boolean;
  editingId: string | null;
  editData: any;
  onEdit: (p: any) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onUpdateEditData: (data: any) => void;
  onDelete: (id: string, nome: string) => void;
  onMarcarEnviada: (p: any) => void;
  onRegistrarResposta: (p: any) => void;
  onRefresh: () => void;
  onEditOrcamento: (id: string) => void;
}

export function Propostas({ proposals, loading, editingId, editData, onEdit, onSave, onCancel, onUpdateEditData, onDelete, onMarcarEnviada, onRegistrarResposta, onRefresh, onEditOrcamento }: PropostasProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-black text-[28px] text-gray-900 mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Propostas
          </h1>
          <p className="text-gray-500 text-sm">{proposals.length} propostas guardadas</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-5 py-3 rounded-[10px] bg-white text-gray-500 border border-gray-200 font-semibold cursor-pointer text-[13px] hover:bg-gray-50 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* States */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">A carregar...</div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          Nenhuma proposta guardada ainda.
        </div>
      ) : (
        <div className="grid gap-4">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-6 border border-gray-100">

              {/* Edit mode */}
              {editingId === p.id ? (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1.5 font-semibold">Cliente</label>
                    <input
                      value={editData.cliente}
                      onChange={(e) => onUpdateEditData({ ...editData, cliente: e.target.value })}
                      className="w-full px-3 py-3 rounded-lg border border-gray-200 text-[13px] bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1.5 font-semibold">Valor (€)</label>
                    <input
                      type="number"
                      value={editData.valor}
                      onChange={(e) => onUpdateEditData({ ...editData, valor: parseFloat(e.target.value) })}
                      className="w-full px-3 py-3 rounded-lg border border-gray-200 text-[13px] bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1.5 font-semibold">Desconto (€)</label>
                    <input
                      type="number"
                      value={editData.desconto}
                      onChange={(e) => onUpdateEditData({ ...editData, desconto: parseFloat(e.target.value) })}
                      className="w-full px-3 py-3 rounded-lg border border-gray-200 text-[13px] bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1.5 font-semibold">Marcas</label>
                    <input
                      type="number"
                      value={editData.marcas}
                      onChange={(e) => onUpdateEditData({ ...editData, marcas: parseInt(e.target.value) })}
                      className="w-full px-3 py-3 rounded-lg border border-gray-200 text-[13px] bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div className="col-span-4 flex gap-3 mt-2">
                    <button
                      onClick={() => onSave(p.id)}
                      className="flex-1 py-3 rounded-lg bg-emerald-500 text-white border-none font-semibold cursor-pointer text-[13px] hover:bg-emerald-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={onCancel}
                      className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-500 border-none font-semibold cursor-pointer text-[13px] hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

              ) : (
                /* View mode */
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Name + status badge */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <span
                        className="font-bold text-[18px] text-gray-900"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        {p.cliente}
                      </span>
                      <span
                        className="text-[11px] px-3 py-1.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: getStatusColor(p) + "15",
                          color: getStatusColor(p),
                        }}
                      >
                        {getStatusLabel(p)}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="text-[13px] text-gray-500 mb-3 flex flex-wrap gap-4">
                      <span>{p.numeroOrcamento}</span>
                      <span className="text-[#F25C05] font-bold">{p.valor?.toFixed(2)} €</span>
                      <span>{p.marcas} marca{p.marcas !== 1 ? "s" : ""}</span>
                      {p.dataEnvio && <span className="text-[#3498DB]">Enviada: {p.dataEnvio}</span>}
                    </div>

                    {/* Serviços tags */}
                    {p.servicos && p.servicos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {p.servicos.slice(0, 4).map((s: string, i: number) => (
                          <span key={i} className="text-[11px] bg-gray-100 px-3 py-1.5 rounded-full text-gray-500 font-medium">
                            {s}
                          </span>
                        ))}
                        {p.servicos.length > 4 && (
                          <span className="text-[11px] text-gray-400">+{p.servicos.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href={`/p/${p.id}`}
                      target="_blank"
                      className="px-4 py-2.5 rounded-lg bg-[#3498DB] text-white text-[12px] font-semibold no-underline inline-block hover:bg-[#2980b9] transition-colors"
                    >
                      Ver Proposta
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`https://aibora.pt/p/${p.id}`); alert("Link copiado!"); }}
                      className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 border-none text-[12px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Copiar
                    </button>
                    <button
                      onClick={() => onEditOrcamento(p.id)}
                      className="px-4 py-2.5 rounded-lg bg-orange-50 text-[#F25C05] border-none text-[12px] font-semibold cursor-pointer hover:bg-orange-100 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onMarcarEnviada(p)}
                      className={`px-4 py-2.5 rounded-lg border-none text-[12px] font-semibold cursor-pointer transition-colors ${
                        p.dataEnvio
                          ? "bg-blue-50 text-[#3498DB] hover:bg-blue-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      Enviada
                    </button>

                    {p.resposta === "sim" ? (
                      <span className="px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-[12px] font-semibold">
                        ✓ Aceite
                      </span>
                    ) : p.resposta === "nao" ? (
                      <span className="px-4 py-2.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold">
                        ✕ Recusado
                      </span>
                    ) : (
                      <button
                        onClick={() => onRegistrarResposta(p)}
                        className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 border-none text-[12px] font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Resposta
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(p.id, p.cliente)}
                      className="px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border-none text-[12px] font-semibold cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}