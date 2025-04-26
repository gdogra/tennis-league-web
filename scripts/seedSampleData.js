/**
 * scripts/seedSampleData.js
 *
 * Seeds Auth + Firestore so you can demo:
 *  ▸ User Management tab
 *  ▸ Match Approvals tab
 */

const { initializeApp, cert }  = require('firebase-admin/app')
const { getAuth }              = require('firebase-admin/auth')
const { getFirestore }         = require('firebase-admin/firestore')
const serviceAccount           = require('../src/lib/serviceAccountKey.json')

initializeApp({ credential: cert(serviceAccount) })
const adminAuth = getAuth()
const db        = getFirestore()

// ───────────────────────── helpers ──────────────────────────
async function upsertUser({ email, displayName, password, role }) {
  let userRec
  try { userRec = await adminAuth.getUserByEmail(email) }
  catch { userRec = await adminAuth.createUser({ email, displayName, password }) }

  await db.doc(`users/${userRec.uid}`).set({
    email,
    displayName,
    role,
    createdAt: new Date(),
  }, { merge: true })

  console.log(`✅ user ${email} (${role}) uid=${userRec.uid}`)
  return userRec
}

async function seed() {
  // 1) Users
  const admin  = await upsertUser({
    email: 'admin@example.com',  displayName: 'Site Admin',
    password: 'Admin#123',       role: 'admin',
  })
  const p1     = await upsertUser({
    email: 'player1@example.com',displayName: 'Player One',
    password: 'Player1#123',     role: 'user',
  })
  const p2     = await upsertUser({
    email: 'player2@example.com',displayName: 'Player Two',
    password: 'Player2#123',     role: 'user',
  })

  // 2) Matches (3 pending matches)
  const matches = [
    { playerA: p1.email, playerB: p2.email, whenHours: 24 },
    { playerA: p2.email, playerB: p1.email, whenHours: 48 },
    { playerA: p1.email, playerB: 'guest@example.com', whenHours: 72 },
  ]
  for (const m of matches) {
    await db.collection('matches').add({
      playerA: m.playerA,
      playerB: m.playerB,
      scheduledAt: new Date(Date.now() + m.whenHours*60*60*1000).toISOString(),
      status: 'pending',
      createdAt: new Date(),
    })
  }
  console.log(`✅ seeded ${matches.length} pending matches`)
}

seed().then(()=>{
  console.log('All done ✨'); process.exit(0)
}).catch(e=>{
  console.error('❌', e); process.exit(1)
})

