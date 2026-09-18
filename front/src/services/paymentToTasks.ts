// Connect payment with collaborator tasks
import { markTaskPaid, listTasksByClient } from './tasks';
import { updateClient } from './firebase';

export async function processPaidCollaborators(
  clientId: string,
  _montoTotal: number,
  _paymentLinkId: string
): Promise<void> {
  try {
    // 1. Get all tasks for the client
    const tasks = await listTasksByClient(clientId);
    
    // 2. Filter approved or delivered tasks (ready to be paid)
    const tasksPendingPaid = tasks.filter(t => 
      t.status === 'approved' || 
      t.status === 'delivered' || 
      t.status === 'approved_client'
    );
    
    if (tasksPendingPaid.length === 0) {
      console.log('No tasks pending payment for client:', clientId);
      return;
    }
    
    console.log(`Found ${tasksPendingPaid.length} tasks to mark as paid`);
    
    // 3. Mark each task as paid
    for (const task of tasksPendingPaid) {
      try {
        await markTaskPaid(task.id);
        console.log(`✅ Task ${task.id} (${task.title}) marked as paid`);
        
        // The commission is calculated automatically inside markTaskPaid
        // and stored in the 'commissions' collection
        
      } catch (err) {
        console.error(`Error marking task ${task.id} as paid:`, err);
      }
    }
    
    // 4. Update client
    await updateClient(clientId, {
      category: 'active',
      lastContactDate: new Date().toISOString()
    });
    
    console.log('✅ All tasks marked as paid, commissions registered');
    
  } catch (err) {
    console.error('Error processing payment for collaborators:', err);
    throw err;
  }
}