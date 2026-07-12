/* ===== IMPORTS ===== */
import { createClient } from "@supabase/supabase-js";

/* ===== VARIABLES ===== */
const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

/* ===== EXPORTS ===== */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
