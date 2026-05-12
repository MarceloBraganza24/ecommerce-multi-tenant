import { normalizeHost } from "@/lib/domainKeys";

const VERCEL_API = "https://api.vercel.com";

function getVercelEnv() {
  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token) throw new Error("Falta VERCEL_API_TOKEN");
  if (!projectId) throw new Error("Falta VERCEL_PROJECT_ID");

  return { token, teamId, projectId };
}

function withTeam(url: string, teamId?: string) {
  if (!teamId) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}teamId=${teamId}`;
}

async function vercelFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const { token } = getVercelEnv();

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        "Error comunicando con Vercel"
    );
  }

  return data as T;
}

export type VercelDomainInfo = {
  name?: string;
  apexName?: string;
  projectId?: string;
  verified?: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason?: string;
  }[];
};

export async function addDomainToVercelProject(domain: string) {
  const { teamId, projectId } = getVercelEnv();
  const normalized = normalizeHost(domain);

  const url = withTeam(
    `${VERCEL_API}/v10/projects/${projectId}/domains`,
    teamId
  );

  return vercelFetch<VercelDomainInfo>(url, {
    method: "POST",
    body: JSON.stringify({
      name: normalized,
    }),
  });
}

export async function getVercelProjectDomain(domain: string) {
  const { teamId, projectId } = getVercelEnv();
  const normalized = normalizeHost(domain);

  const url = withTeam(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${normalized}`,
    teamId
  );

  return vercelFetch<VercelDomainInfo>(url, {
    method: "GET",
  });
}

export async function verifyVercelProjectDomain(domain: string) {
  const { teamId, projectId } = getVercelEnv();
  const normalized = normalizeHost(domain);

  const url = withTeam(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${normalized}/verify`,
    teamId
  );

  return vercelFetch<VercelDomainInfo>(url, {
    method: "POST",
  });
}

export function getDnsInstructions(domain: string) {
  const normalized = normalizeHost(domain);
  const parts = normalized.split(".");

  const isApex = parts.length === 2;

  if (isApex) {
    return {
      type: "A",
      name: "@",
      value: "76.76.21.21",
      description:
        "Agregá un registro A apuntando tu dominio raíz a Vercel.",
    };
  }

  return {
    type: "CNAME",
    name: normalized.replace(`.${parts.slice(-2).join(".")}`, ""),
    value: "cname.vercel-dns.com",
    description:
      "Agregá un registro CNAME apuntando este subdominio a Vercel.",
  };
}