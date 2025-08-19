import { env } from "../../config/env.js";

interface CreateUserParams {
  email: string;
  password: string;
}

async function supabaseFetch(path: string, init: RequestInit) {
  const res = await fetch(env.SUPABASE_URL + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase admin API ${path} failed: ${res.status} ${text}`);
  }
  return res;
}

export async function createSupabaseUser(params: CreateUserParams) {
  const res = await supabaseFetch("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      email_confirm: true,
    }),
  });
  return (await res.json()) as { id: string; email: string };
}

export async function deleteSupabaseUser(id: string) {
  await supabaseFetch("/auth/v1/admin/users/" + id, { method: "DELETE" });
}

export async function resetPasswordSupabase(email: string) {
  const res = await supabaseFetch("/auth/v1/recover", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
  return await res.json();
}

export async function confirmEmailSupabase(token: string, email: string) {
  const res = await supabaseFetch("/auth/v1/verify", {
    method: "POST",
    body: JSON.stringify({
      type: "email",
      token,
      email,
    }),
  });
  return await res.json();
}
