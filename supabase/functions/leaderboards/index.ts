/* ===== IMPORTS ===== */
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

/* ===== EDGE FUNCTION ===== */

// The leaderboards function serves the queries that generate the leaderboard pages. Callers authenticate with the publishable
// key alone: leaderboards are public data, and a logged out visitor sends no `Authorization` header at all, so a user JWT cannot
// be required here.
export default {
  fetch: withSupabase(
    { auth: "publishable" },
    (_req, ctx) => Promise.resolve(Response.json({ authMode: ctx.authMode })),
  ),
};
