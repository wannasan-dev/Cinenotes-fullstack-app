import { apiRequest } from "./apiClient";
import type { AuditLogResponse } from "../types/admin";

export function fetchAuditLogs(
  token?: string | null
): Promise<AuditLogResponse[]> {
  return apiRequest<AuditLogResponse[]>("/admin/audit-logs", { token });
}

export function fetchAuditLogsByActor(
  actorUserId: number,
  token?: string | null
): Promise<AuditLogResponse[]> {
  return apiRequest<AuditLogResponse[]>(
    `/admin/audit-logs/actor/${actorUserId}`,
    { token }
  );
}
