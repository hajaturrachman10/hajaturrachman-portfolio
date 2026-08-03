import crypto from "crypto";
import { AdminSession } from "./adminTypes";
import { timingSafeCompare } from "@/lib/security";

const SECRET = process.env.ADMIN_SESSION_SECRET || "hajaturrachman_admin_secure_hmac_key_v2_2026";

export const adminSecurity = {
  signSession(session: AdminSession): string {
    const payloadStr = JSON.stringify(session);
    const payloadBase64 = Buffer.from(payloadStr).toString("base64url");
    const signature = crypto.createHmac("sha256", SECRET).update(payloadBase64).digest("hex");
    return `${payloadBase64}.${signature}`;
  },

  verifySession(token?: string): { valid: boolean; session?: AdminSession } {
    if (!token || typeof token !== "string") {
      return { valid: false };
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 2) return { valid: false };

      const [payloadBase64, signature] = parts;
      if (!payloadBase64 || !signature) return { valid: false };

      const expectedSignature = crypto.createHmac("sha256", SECRET).update(payloadBase64).digest("hex");
      if (!timingSafeCompare(signature, expectedSignature)) {
        return { valid: false };
      }

      const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
      const session = JSON.parse(payloadStr) as AdminSession;

      // Check session expiration
      if (Date.now() > session.expiresAt) {
        return { valid: false };
      }

      return { valid: true, session };
    } catch {
      return { valid: false };
    }
  }
};
