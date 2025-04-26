// src/pages/api/debug/users.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../../../lib/serviceAccountKey.json";

// Initialize the Admin SDK once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const decoded = await getAuth().verifyIdToken(idToken);

    // Check that user has admin role
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Not an admin" });
    }

    // Fetch and return all users
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ users });
  } catch (err: any) {
    return res.status(401).json({ error: err.message });
  }
}
