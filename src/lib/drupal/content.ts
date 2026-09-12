import type { NewsItem } from "@/lib/data/types";
import { isDrupalConfigured, serverEnv } from "@/lib/env";
import { fetchDrupalCollection, mapDrupalNewsNode } from "./client";

export function shouldUseDrupalContent(): boolean {
  if (serverEnv.contentSource === "supabase") return false;
  if (serverEnv.contentSource === "drupal") return isDrupalConfigured;
  return isDrupalConfigured;
}

export async function getDrupalNews(): Promise<NewsItem[] | null> {
  if (!shouldUseDrupalContent()) return null;
  try {
    const nodes = await fetchDrupalCollection(serverEnv.drupalBaseUrl, "news", {
      sort: "-created",
      pageLimit: 50,
      token: serverEnv.drupalApiToken || undefined,
    });
    return nodes.map(mapDrupalNewsNode);
  } catch (error) {
    console.error("Drupal news read failed; falling back to existing content source", error);
    return null;
  }
}
