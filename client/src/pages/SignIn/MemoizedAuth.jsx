/* ===== IMPORTS ===== */
import { Auth } from "@supabase/auth-ui-react";
import { memo } from "react";

/* ===== MEMOIZED AUTH COMPONENT ===== */
const MemoizedAuth = memo(Auth, (prevProps, nextProps) => {
  return prevProps.supabaseClient === nextProps.supabaseClient; 
});

/* ===== EXPORTS ===== */
export default MemoizedAuth;