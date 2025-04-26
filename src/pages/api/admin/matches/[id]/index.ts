import type { NextApiRequest, NextApiResponse } from "next";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { z } from "zod";
import { validate } from "../../../../../lib/validate";
import serviceAccount from "../../../../../lib/serviceAccountKey.json";

if (!getApps().length)
  initializeApp({ credential: cert(serviceAccount as any) });

const adminAuth = getAdminAuth();
const db = getFirestore();

async function verifyAdmin(req: NextApiRequest): Promise<string> {
  const hdr = req.headers.authorization ?? "";
  if (!hdr.startsWith("Bearer ")) throw { status: 401, msg: "Missing token" };
  const decoded = await adminAuth.verifyIdToken(hdr.split("Bearer ")[1]);
  const snap = await db.doc(`users/${decoded.uid}`).get();
  if (snap.data()?.role !== "admin") throw { status: 403, msg: "Not admin" };
  return decoded.uid;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const actorUid = await verifyAdmin(req);

    if (req.method !== "PATCH") {
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).end();
    }

    const matchId = req.query.id as string;
    const { status } = validate(
      z.object({ status: z.enum(["approved", "rejected"]) }),
      req.body,
    );

    await db.doc(`matches/${matchId}`).set({ status }, { merge: true });

    await db.doc(`adminLogs/${nanoid()}`).set({
      actorUid,
      target: { type: "match", id: matchId },
      action: `match_${status}`,
      at: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ matchId, status });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message });
  }
}
