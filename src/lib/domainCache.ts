import { redis } from "@/lib/redis";
import { domainKey } from "@/lib/domainKeys";
import {
  deleteDomainFromEdgeConfig,
  upsertDomainInEdgeConfig,
} from "@/lib/edgeConfigAdmin";

export async function setDomainMapping(host: string, slug: string) {
  await Promise.all([
    redis.set(domainKey(host), slug),
    upsertDomainInEdgeConfig(host, slug),
  ]);
}

export async function deleteDomainMapping(host: string) {
  await Promise.all([
    redis.del(domainKey(host)),
    deleteDomainFromEdgeConfig(host),
  ]);
}