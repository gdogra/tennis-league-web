/**
 * scripts/seedFirestore.js
 *
 * Seeds Firestore with an Admin user profile by looking up the user
 * record via email so you don't need to manually specify the UID.
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
const path = require('path')

// Adjust this path if your service account JSON lives elsewhere
const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'))

// Initialize the Admin SDK
initializeApp({
  credential: cert(serviceAccount),
})
const db = getFirestore()
const authAdmin = getAuth()

async function seed() {
  const adminEmail = 'admin@example.com'   // <— change if different
  console.log(`Looking up user by email: ${adminEmail}`)

  // Fetch the user record to get their UID
  const userRecord = await authAdmin.getUserByEmail(adminEmail)
  const uid = userRecord.uid
  console.log(`Found UID ${uid} for ${adminEmail}`)

  // Write (or merge) the Firestore profile
  await db.collection('users').doc(uid).set(
    {
      email: adminEmail,
      displayName: 'Site Admin',
      role: 'admin',
      createdAt: new Date(),
    },
    { merge: true }
  )

  console.log('✅ Seeded admin user in Firestore under /users/', uid)
}

seed().catch(err => {
  console.error('❌ Error seeding Firestore:', err)
  process.exit(1)
})

