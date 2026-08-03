import crypto from "crypto";
import { adminRepository } from "@/services/admin/adminRepository";
import { FeatureType } from "@/services/admin/adminTypes";

// Secret key for HMAC signing (uses environment variable or secure default)
const SECRET = process.env.AUTH_SECRET || "hajaturrachman_secure_session_secret_v2_2026";

// Rate limiting & Brute force tracking store (In-Memory)
type RateLimitRecord = {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
};

const authRateLimitMap = new Map<string, RateLimitRecord>();
const contactRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function mapPublicTypeToFeature(type: string): FeatureType {
  if (type === "private-vault") return "vault";
  if (type === "ecl-material") return "ecl";
  return "cv";
}

/**
 * Generate HMAC-SHA256 signature for session type
 */
export function generateSessionToken(type: string): string {
  const now = Date.now();
  const payload = `${type}:unlocked:${now}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verify signed session token with Live Feature Toggle & Global Epoch Check
 */
export function verifySessionToken(token: string | undefined, expectedType: string): boolean {
  try {
    const adminState = adminRepository.read();
    const featureKey = mapPublicTypeToFeature(expectedType);
    const featureState = adminState.toggles[featureKey];

    // If feature toggle is UNPROTECTED (OFF), allow instant public access
    if (featureState && !featureState.protected) {
      return true;
    }

    if (!token) return false;

    // Support legacy "true" token if created prior to epoch
    if (token === "true") {
      return featureState ? !featureState.protected : false;
    }

    const [payload, signature] = token.split(".");
    if (!payload || !signature) return false;

    const [type, status, tokenTimestampStr] = payload.split(":");
    if (type !== expectedType || status !== "unlocked") return false;

    // Session Revocation: Invalidate session if created before globalEpoch
    const tokenTimestamp = Number(tokenTimestampStr) || 0;
    if (tokenTimestamp > 0 && tokenTimestamp < adminState.globalEpoch) {
      return false;
    }

    const expectedSignature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to keep constant execution time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Extract client IP address from headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Rate limit check for Password Authentication (Max 5 failed attempts per 15 minutes)
 */
export function checkAuthRateLimit(ip: string): { allowed: boolean; remainingSeconds: number } {
  const now = Date.now();
  const record = authRateLimitMap.get(ip);

  if (record && record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Record a failed authentication attempt
 */
export function recordFailedAuthAttempt(ip: string): { lockedOut: boolean; remainingAttempts: number; remainingSeconds: number } {
  const now = Date.now();
  const lockoutDuration = 10 * 60 * 1000; // 10 minutes lockout (600 seconds)
  const maxAttempts = 5;

  const record = authRateLimitMap.get(ip) || { attempts: 0, lockoutUntil: 0, lastAttempt: now };

  // Reset if last attempt was more than lockout duration
  if (now - record.lastAttempt > lockoutDuration) {
    record.attempts = 0;
  }

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= maxAttempts) {
    record.lockoutUntil = now + lockoutDuration;
    authRateLimitMap.set(ip, record);
    return { lockedOut: true, remainingAttempts: 0, remainingSeconds: 600 };
  }

  authRateLimitMap.set(ip, record);
  return { lockedOut: false, remainingAttempts: maxAttempts - record.attempts, remainingSeconds: 0 };
}

/**
 * Reset failed attempts on successful login
 */
export function resetAuthRateLimit(ip: string) {
  authRateLimitMap.delete(ip);
}

/**
 * Clear all lockout rate limits
 */
export function clearAllAuthRateLimits() {
  authRateLimitMap.clear();
}

/**
 * Get all active lockout rate limit records
 */
export function getAllAuthRateLimits(): Array<{ ip: string; attempts: number; lockoutUntil: number }> {
  const result: Array<{ ip: string; attempts: number; lockoutUntil: number }> = [];
  authRateLimitMap.forEach((record, ip) => {
    result.push({ ip, attempts: record.attempts, lockoutUntil: record.lockoutUntil });
  });
  return result;
}

/**
 * Rate limit check for Contact Form (Max 3 submissions per hour per IP)
 */
export function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxSubmissions = 3;

  const record = contactRateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    contactRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxSubmissions) {
    return false;
  }

  record.count += 1;
  return true;
}
