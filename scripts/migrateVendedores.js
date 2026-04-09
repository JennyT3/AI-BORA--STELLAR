/**
 * ============================================
 * FIREBASE AUTH MIGRATION SCRIPT
 * ============================================
 *
 * This script migrates existing vendedores from plain-text passwords
 * to Firebase Authentication.
 *
 * INSTRUCTIONS:
 * 1. Run this script in the Firebase Console (Functions) client
 *    OR locally with Firebase emulators
 * 2. Before running, back up the 'vendedores' collection
 * 3. After migration, update Firestore Rules
 *
 * WARNING: This script should be run ONLY ONCE
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Configuration — replace with your project credentials
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function migrateVendedores() {
  console.log('🚀 Starting Vendedor Migration to Firebase Auth...\n');

  try {
    // 1. Fetch all vendedores
    console.log('📋 Fetching all vendedores...');
    const vendedoresSnapshot = await getDocs(collection(db, 'vendedores'));
    const totalVendedores = vendedoresSnapshot.size;
    console.log(`   Found ${totalVendedores} vendedores\n`);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // 2. For each vendedor, create a Firebase Auth account
    for (const vendedorDoc of vendedoresSnapshot.docs) {
      const vendedor = vendedorDoc.data();
      const email = vendedor.email;
      const nome = vendedor.nome;

      if (!email) {
        console.log(`   ⚠️ Skipping ${vendedorDoc.id} - no email`);
        continue;
      }

      // Skip if already migrated
      if (vendedor.authMigrated) {
        console.log(`   ✅ ${email} - already migrated`);
        continue;
      }

      // If no password, create account with temporary password
      const tempPassword = generateTempPassword();
      
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        
        // Update document in Firestore
        await updateDoc(doc(db, 'vendedores', vendedorDoc.id), {
          authUid: userCredential.user.uid,
          authMigrated: true,
          migratedAt: new Date().toISOString(),
          // Remove plain-text password (if present)
          password: null,
          // Keep other fields intact
          ativo: vendedor.ativo !== false,
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ Migrated: ${email} (UID: ${userCredential.user.uid})`);
        
        // NOTE: At this point you should email the vendedor
        // with instructions to reset the temporary password
        // This requires integrating with an email service
        
        successCount++;

      } catch (error) {
        console.log(`   ❌ Failed: ${email} - ${error.message}`);
        failCount++;
        errors.push({ email, error: error.message });
      }
    }

    // 3. Summary
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

// Generate a secure temporary password
function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + 'A1!';
}

// Run when executed directly
if (require.main === module) {
  migrateVendedores()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateVendedores };

/**
 * ============================================
 * ALTERNATIVE VERSION — RUN IN THE BROWSER
 * ============================================
 *
 * To run in the browser (after logging in as admin):
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
 *         const tempUid = 'vendedor_' + docSnap.id;
 *
 *         await updateDoc(doc(db, 'vendedores', docSnap.id), {
 *           tempUid: tempUid,
 *           authMigrated: false, // Pending
 *           // Do NOT remove password yet — keep until verified
 *         });
 *         console.log('Marked:', data.email);
 *       } catch (e) {
 *         console.error('Error:', e);
 *       }
 *     }
 *   }
 * }
 */
