export type AdminAuditEvent = 
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "SESSION_EXPIRED"
  | "LOCKOUT_TRIGGERED"
  | "LOCKOUT_RESET"
  | "SESSION_REVOKED"
  | "TOGGLE_CHANGED"
  | "PASSWORD_CHANGED"
  | "USERNAME_CHANGED"
  | "SETTINGS_UPDATED"
  | "CONFIGURATION_CREATED"
  | "CONFIGURATION_UPDATED"
  | "CONFIGURATION_RESTORED"
  | "CONFIGURATION_PREVIEWED"
  | "SNAPSHOT_CREATED"
  | "SNAPSHOT_RESTORED"
  | "REAUTH_SUCCESS"
  | "REAUTH_FAILED"
  | "SESSION_TIMEOUT"
  | "CONFIGURATION_EXPORTED"
  | "LAST_LOGIN_UPDATED"
  | "FAILED_LOGIN_RECORDED"
  | "SUCCESS_LOGIN_RECORDED";

export function logAdminEvent(event: AdminAuditEvent, details?: string, ip?: string): void {
  const timestamp = new Date().toISOString();
  const ipInfo = ip ? ` [IP: ${ip}]` : "";
  const detailInfo = details ? ` - ${details}` : "";
  console.log(`[ADMIN AUDIT LOG] ${timestamp} | EVENT: ${event}${ipInfo}${detailInfo}`);
}
