// scripts/seedSampleData.js
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const serviceAccount = require('../src/lib/serviceAccountKey.json')

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()

async function seedMatches() {
  const matches = [
    {
      player1Id: 'USERID_1',     // <-- replace with real UID
      player1Name: 'John Doe',
      player2Id: 'USERID_2',
      player2Name: 'Jane Smith',
      playerIds: ['USERID_1', 'USERID_2'],   // 🔥 array-contains search
      score: null,                // No score yet
      status: 'pending',
      createdAt: new Date(),
    },
    {
      player1Id: 'USERID_2',
      player1Name: 'Jane Smith',
      player2Id: 'USERID_3',
      player2Name: 'Mike Johnson',
      playerIds: ['USERID_2', 'USERID_3'],
      score: '6-4, 7-5',
      status: 'approved',
      createdAt: new Date(),
    }
  ]

  for (const match of matches) {
    const ref = db.collection('matches').doc()
    await ref.set(match)
    console.log('✅ Seeded match:', ref.id)
  }
}

seedMatches().catch((err) => {
  console.error('❌ Error seeding matches:', err)
  process.exit(1)
})

