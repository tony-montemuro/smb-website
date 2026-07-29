/* ===== IMPORTS ===== */
import { createClient } from "@supabase/supabase-js";

/* ===== VARIABLES ===== */
const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_APP_SUPABASE_PUBLISHABLE_KEY;

/* ===== EXPORTS ===== */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
