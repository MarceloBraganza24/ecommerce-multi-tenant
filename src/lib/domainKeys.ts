export function normalizeHost(host: string) {
  return host
    .toLowerCase()
    .replace(/^www\./, "")
    .split(":")[0]
    .trim();
}

export function domainKey(host: string) {
  return `domain:${normalizeHost(host)}`;
}

export function edgeDomainKey(host: string) {
  return `domain_${normalizeHost(host).replace(/[^a-z0-9_-]/g, "_")}`;
}

export function isValidCustomDomain(domain: string) {
  const normalized = normalizeHost(domain);

  if (!normalized.includes(".")) return false;
  if (normalized.includes("localhost")) return false;
  if (normalized.includes("/")) return false;
  if (normalized.length < 4) return false;

  return /^[a-z0-9.-]+$/.test(normalized);
}