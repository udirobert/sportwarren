export interface EnsDataResponse {
  address: string;
  ens?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
}

const ENSDATA_API_BASE = "https://ensdata.net";

export async function resolveEnsName(address: string): Promise<string | null> {
  try {
    const res = await fetch(`${ENSDATA_API_BASE}/${address}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data: EnsDataResponse = await res.json();
    return data.ens ?? null;
  } catch {
    return null;
  }
}

export async function resolveEnsWithFallback(address: string): Promise<string | null> {
  const name = await resolveEnsName(address);
  if (name) return name;
  try {
    const res = await fetch(`https://api.web3.bio/profile/${address}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.identity ?? null;
  } catch {
    return null;
  }
}
