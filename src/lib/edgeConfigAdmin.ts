import { edgeDomainKey } from "@/lib/domainKeys";

type EdgeOperation =
  | {
      operation: "upsert";
      key: string;
      value: string;
    }
  | {
      operation: "delete";
      key: string;
    };

function getEdgeConfigUrl() {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!edgeConfigId) {
    throw new Error("Falta EDGE_CONFIG_ID");
  }

  const base = `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

  return teamId ? `${base}?teamId=${teamId}` : base;
}

async function updateEdgeConfig(items: EdgeOperation[]) {
  const token = process.env.VERCEL_API_TOKEN;

  if (!token) {
    throw new Error("Falta VERCEL_API_TOKEN");
  }

  const res = await fetch(getEdgeConfigUrl(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error actualizando Edge Config: ${text}`);
  }
}

export async function upsertDomainInEdgeConfig(host: string, slug: string) {
  await updateEdgeConfig([
    {
      operation: "upsert",
      key: edgeDomainKey(host),
      value: slug,
    },
  ]);
}

export async function deleteDomainFromEdgeConfig(host: string) {
  await updateEdgeConfig([
    {
      operation: "delete",
      key: edgeDomainKey(host),
    },
  ]);
}