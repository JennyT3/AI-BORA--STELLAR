// Conectar el pago con las tareas del colaborador
import { updateTarea, marcarTareaPaga, listTareasByCliente } from './tareas';
import { updateCliente } from './firebase';

export async function procesarPagoColaboradores(
  clienteId: string,
  montoTotal: number,
  paymentLinkId: string
): Promise<void> {
  try {
    // 1. Obtener todas las tareas del cliente
    const tareas = await listTareasByCliente(clienteId);
    
    // 2. Filtrar tareas aprobadas o entregadas (listas para pagar)
    const tareasPendientesPago = tareas.filter(t => 
      t.estado === 'aprovada' || 
      t.estado === 'entregue' || 
      t.estado === 'aprovada_cliente'
    );
    
    if (tareasPendientesPago.length === 0) {
      console.log('No tasks pending payment for client:', clienteId);
      return;
    }
    
    console.log(`Found ${tareasPendientesPago.length} tasks to mark as paid`);
    
    // 3. Marcar cada tarea como pagada
    for (const tarea of tareasPendientesPago) {
      try {
        await marcarTareaPaga(tarea.id);
        console.log(`✅ Task ${tarea.id} (${tarea.titulo}) marked as paid`);
        
        // La comisión se calcula automáticamente en marcarTareaPaga
        // y se guarda en la colección 'comisiones'
        
      } catch (err) {
        console.error(`Error marking task ${tarea.id} as paid:`, err);
      }
    }
    
    // 4. Actualizar cliente
    await updateCliente(clienteId, {
      status: 'ativo',
      ultimoPagamento: new Date().toISOString()
    });
    
    console.log('✅ All tasks marked as paid, commissions registered');
    
  } catch (err) {
    console.error('Error processing payment for collaborators:', err);
    throw err;
  }
}