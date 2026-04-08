/**
 * ============================================
 * SCRIPT DE MIGRAÇÃO PARA FIREBASE AUTH
 * ============================================
 * 
 * Este script migra vendedores existentes do sistema de passwords
 * em texto plano para Firebase Authentication.
 * 
 * INSTRUÇÕES:
 * 1. Execute este script no cliente Firebase Console (Functions) 
 *    OU localmente com firebase emulators
 * 2. Antes de executar, faça backup da coleção 'vendedores'
 * 3. Após migração, atualize as Firestore Rules
 * 
 * WARNING: Este script deve ser executado APENAS UMA VEZ
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Configuração - substituir com credenciais do projeto
const firebaseConfig = {
  //填入你的Firebase配置
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function migrateVendedores() {
  console.log('🚀 Starting Vendedor Migration to Firebase Auth...\n');

  try {
    // 1. Buscar todos os vendedores
    console.log('📋 Fetching all vendedores...');
    const vendedoresSnapshot = await getDocs(collection(db, 'vendedores'));
    const totalVendedores = vendedoresSnapshot.size;
    console.log(`   Found ${totalVendedores} vendedores\n`);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // 2. Para cada vendedor, criar conta no Firebase Auth
    for (const vendedorDoc of vendedoresSnapshot.docs) {
      const vendedor = vendedorDoc.data();
      const email = vendedor.email;
      const nome = vendedor.nome;

      if (!email) {
        console.log(`   ⚠️ Skipping ${vendedorDoc.id} - no email`);
        continue;
      }

      // Se já foi migrado, pular
      if (vendedor.authMigrated) {
        console.log(`   ✅ ${email} - already migrated`);
        continue;
      }

      // Se não tem password, criar conta com password temporária
      const tempPassword = generateTempPassword();
      
      try {
        // Criar utilizador no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        
        // Atualizar documento no Firestore
        await updateDoc(doc(db, 'vendedores', vendedorDoc.id), {
          authUid: userCredential.user.uid,
          authMigrated: true,
          migratedAt: new Date().toISOString(),
          // Remover password em texto plano (se existir)
          password: null,
          // Manter outros campos intactos
          ativo: vendedor.ativo !== false,
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ Migrated: ${email} (UID: ${userCredential.user.uid})`);
        
        // NOTA: Neste ponto, você deveria enviar email ao vendedor
        // com instruções para redefinir a password temporária
        // Isso requer integrar com um serviço de email
        
        successCount++;

      } catch (error) {
        console.log(`   ❌ Failed: ${email} - ${error.message}`);
        failCount++;
        errors.push({ email, error: error.message });
      }
    }

    // 3. Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`   Total: ${totalVendedores}`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log('='.repeat(50));

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => console.log(`   - ${e.email}: ${e.error}`));
    }

    console.log('\n✅ Migration complete!');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Update firestore.rules to remove password field access');
    console.log('   2. Send password reset emails to all migrated users');
    console.log('   3. Test login with new Firebase Auth flow');
    console.log('   4. Remove tempPassword field after all users reset passwords');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Gerar password temporária segura
function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + 'A1!';
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateVendedores()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateVendedores };

/**
 * ============================================
 * VERSÃO ALTERNATIVA - EXECUTAR NO BROWSER
 * ============================================
 * 
 * Para executar no browser (após login como admin):
 * 
 * async function migrateAllVendedores() {
 *   const db = getFirestore();
 *   const auth = getAuth();
 *   
 *   const snapshot = await getDocs(collection(db, 'vendedores'));
 *   
 *   for (const docSnap of snapshot.docs) {
 *     const data = docSnap.data();
 *     if (data.email && !data.authMigrated && data.password) {
 *       try {
 *         // Gerar UID temporário (não cria no Auth ainda!)
 *         const tempUid = 'vendedor_' + docSnap.id;
 *         
 *         await updateDoc(doc(db, 'vendedores', docSnap.id), {
 *           tempUid: tempUid,
 *           authMigrated: false, // Pendente
 *           // NÃO remover password ainda - manter até verificar
 *         });
 *         console.log('Marked:', data.email);
 *       } catch (e) {
 *         console.error('Error:', e);
 *       }
 *     }
 *   }
 * }
 */