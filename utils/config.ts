import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

export const TMDB_API_KEY = env.TMDB_API_KEY ||
  Deno.env.get("TMDB_API_KEY") || "";

if (!TMDB_API_KEY) {
  throw new Error("TMDB_API_KEY is required");
}
