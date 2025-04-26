import type { NextApiRequest, NextApiResponse } from "next";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { validate } from "../../../../../lib/validate";
import { nanoid } from "nanoid";
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
    const uid = req.query.uid as string;

    /* ───── PATCH  update role ───── */
    if (req.method === "PATCH") {
      const { role } = validate(
        z.object({ role: z.enum(["admin", "user"]) }),
        req.body,
      );
      await db.doc(`users/${uid}`).set({ role }, { merge: true });

      await db.doc(`adminLogs/${nanoid()}`).set({
        actorUid,
        action: "set_role",
        target: { type: "user", id: uid },
        after: { role },
        at: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ uid, role });
    }

    /* ───── DELETE  remove user ──── */
    if (req.method === "DELETE") {
      await adminAuth.deleteUser(uid);
      await db.doc(`users/${uid}`).delete();

      await db.doc(`adminLogs/${nanoid()}`).set({
        actorUid,
        action: "delete_user",
        target: { type: "user", id: uid },
        at: FieldValue.serverTimestamp(),
      });

      return res.status(204).end();
    }

    res.setHeader("Allow", ["PATCH", "DELETE"]);
    return res.status(405).end();
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.msg || e.message });
  }
}
