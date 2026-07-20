import { createClient } from "@insforge/sdk";

const INSFORGE_URL =
  import.meta.env.VITE_INSFORGE_URL || "https://6uvfcvui.us-east.insforge.app";

const ANON_KEY =
  import.meta.env.VITE_INSFORGE_ANON_KEY || "anon_dec552c699198fb2b268883f7fe48c40db6f62cab0cb8be8717a4b7535c0f711";

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: ANON_KEY,
});

export { INSFORGE_URL };
