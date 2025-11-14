// src/api/userApi.ts

export interface UserProfile {
  id: number;
  email: string;
  displayName?: string | null;
  name?: string | null;
  role?: string | null;
  selectedDevices: string[];
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AlertConfig {
  userId: number;
  email: string;
  selectedModels: string[];
  updatedAt: Date;
}

// Vite exposes client env vars via import.meta.env and requires the VITE_ prefix
// Default to same-origin so the Vite dev proxy can forward requests to the backend.
// When deploying to production, set `VITE_USER_API_BASE_URL` to your API host (no trailing slash).
const BASE = (import.meta.env.VITE_USER_API_BASE_URL ?? '').replace(/\/+$/u, '');

/** Helper to build headers */
function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers.Authorization = `Token ${token}`;
  }
  return headers;
}

/** Helper to check response and extract JSON or throw with message */
async function handleResp(res: Response) {
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  if (!res.ok) {
    const message = (body && body.error) || (body && body.detail) || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return body;
}

/**
 * Login - returns token and user
 * Example response from backend: { token: string, user: { ... } }
 */
export async function login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${BASE}/api/login/`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const body = await handleResp(res);
  // Normalize user fields (backend returns createdAt/lastLoginAt maybe absent)
  const rawUser = body.user || {};
  const user: UserProfile = {
    id: rawUser.id,
    email: rawUser.email,
    displayName: rawUser.name ?? rawUser.displayName ?? null,
    name: rawUser.name ?? null,
    role: rawUser.role ?? null,
    selectedDevices: rawUser.selectedDevices ?? [],
    createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
    lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
  };
  return { token: body.token, user };
}

/** Logout - invalidates the token on the server */
export async function logout(token: string): Promise<void> {
  const res = await fetch(`${BASE}/api/logout/`, {
    method: 'POST',
    headers: buildHeaders(token),
  });
  await handleResp(res);
}

/** Get current user from token (GET /api/me/) */
export async function getCurrentUser(token: string): Promise<UserProfile> {
  const res = await fetch(`${BASE}/api/me/`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const body = await handleResp(res);
  const rawUser = body.user || body;
  return {
    id: rawUser.id,
    email: rawUser.email,
    displayName: rawUser.name ?? rawUser.displayName ?? null,
    name: rawUser.name ?? null,
    role: rawUser.role ?? null,
    selectedDevices: rawUser.selectedDevices ?? [],
    createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
    lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
  };
}

/**
 * Create or update an app user.
 * If `id` is passed -> update (PATCH), otherwise create (POST).
 * Requires admin token for creation/update.
 */
export async function saveUserProfileByAdmin(
  token: string,
  user: {
    id?: number;
    email: string;
    name?: string;
    role?: string;
    selectedDevices?: string[];
    password?: string;
  }
): Promise<UserProfile> {
  if (!token) throw new Error('Admin token is required to create/update users');

  if (user.id) {
    // update
    const res = await fetch(`${BASE}/api/users/${user.id}/`, {
      method: 'PATCH',
      headers: buildHeaders(token),
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        selectedDevices: user.selectedDevices,
        password: user.password,
      }),
    });
    const body = await handleResp(res);
    const rawUser = body.user || body;
    return {
      id: rawUser.id,
      email: rawUser.email,
      displayName: rawUser.name ?? null,
      name: rawUser.name ?? null,
      role: rawUser.role ?? null,
      selectedDevices: rawUser.selectedDevices ?? [],
      createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
      lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
    };
  } else {
    // create
    const res = await fetch(`${BASE}/api/users/`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        selectedDevices: user.selectedDevices ?? [],
        password: user.password ?? '',
      }),
    });
    const body = await handleResp(res);
    const rawUser = body.user || body;
    return {
      id: rawUser.id,
      email: rawUser.email,
      displayName: rawUser.name ?? null,
      name: rawUser.name ?? null,
      role: rawUser.role ?? null,
      selectedDevices: rawUser.selectedDevices ?? [],
      createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
      lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
    };
  }
}

/** Get all users (admin or any authenticated token depending on backend) */
export async function getAllUsers(token: string): Promise<UserProfile[]> {
  const res = await fetch(`${BASE}/api/users/`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const body = await handleResp(res);
  // backend returns { users: [...] } per our implementation
  const raw = body.users ?? body;
  return (raw || []).map((rawUser: any) => ({
    id: rawUser.id,
    email: rawUser.email,
    displayName: rawUser.name ?? null,
    name: rawUser.name ?? null,
    role: rawUser.role ?? null,
    selectedDevices: rawUser.selectedDevices ?? [],
    createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
    lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
  }));
}

/** Delete user by id (admin token required) */
export async function deleteUser(token: string, id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${id}/`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  });
  await handleResp(res);
}

/** Get individual user (by id) */
export async function getUser(token: string, id: number): Promise<UserProfile> {
  const res = await fetch(`${BASE}/api/users/${id}/`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  const body = await handleResp(res);
  const rawUser = body.user || body;
  return {
    id: rawUser.id,
    email: rawUser.email,
    displayName: rawUser.name ?? null,
    name: rawUser.name ?? null,
    role: rawUser.role ?? null,
    selectedDevices: rawUser.selectedDevices ?? [],
    createdAt: rawUser.createdAt ? new Date(rawUser.createdAt) : new Date(),
    lastLoginAt: rawUser.lastLoginAt ? new Date(rawUser.lastLoginAt) : new Date(),
  };
}

/**
 * Alert config helpers mapped to users.selectedDevices.
 * - getUserAlertConfig(userId): reads selectedDevices from user record.
 * - saveUserAlertConfig: updates selectedDevices via PATCH /api/users/{id}/
 * - getAllAlertConfigs: maps all users -> AlertConfig[] where selectedModels = selectedDevices
 */

/** Get alert config for a specific user */
export async function getUserAlertConfig(token: string, userId: number): Promise<AlertConfig> {
  const user = await getUser(token, userId);
  return {
    userId: user.id,
    email: user.email,
    selectedModels: user.selectedDevices ?? [],
    updatedAt: user.lastLoginAt ?? new Date(),
  };
}

/** Save alert configuration for a user by patching selectedDevices */
export async function saveUserAlertConfig(
  token: string,
  userId: number,
  email: string,
  config: { selectedModels: string[] }
): Promise<void> {
  await saveUserProfileByAdmin(token, {
    id: userId,
    email,
    selectedDevices: config.selectedModels,
  });
}

/** Get alert configs for all users (map from users) */
export async function getAllAlertConfigs(token: string): Promise<AlertConfig[]> {
  const users = await getAllUsers(token);
  return users.map((u) => ({
    userId: u.id,
    email: u.email,
    selectedModels: u.selectedDevices ?? [],
    updatedAt: u.lastLoginAt ?? new Date(),
  }));
}