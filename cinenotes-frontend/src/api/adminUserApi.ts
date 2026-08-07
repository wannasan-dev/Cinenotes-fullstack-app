import { apiRequest } from "./apiClient";
import type {
  UpdateUserRoleRequest,
  UserAdminResponse,
} from "../types/admin";

export function fetchAdminUsers(
  token?: string | null
): Promise<UserAdminResponse[]> {
  return apiRequest<UserAdminResponse[]>("/admin/users", { token });
}

export function fetchAdminUserById(
  id: number,
  token?: string | null
): Promise<UserAdminResponse> {
  return apiRequest<UserAdminResponse>(`/admin/users/${id}`, { token });
}

export function updateAdminUserRole(
  id: number,
  request: UpdateUserRoleRequest,
  token?: string | null
): Promise<UserAdminResponse> {
  return apiRequest<UserAdminResponse>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: request,
    token,
  });
}

export function activateAdminUser(
  id: number,
  token?: string | null
): Promise<UserAdminResponse> {
  return apiRequest<UserAdminResponse>(`/admin/users/${id}/activate`, {
    method: "PATCH",
    token,
  });
}

export function deactivateAdminUser(
  id: number,
  token?: string | null
): Promise<UserAdminResponse> {
  return apiRequest<UserAdminResponse>(`/admin/users/${id}/deactivate`, {
    method: "PATCH",
    token,
  });
}
