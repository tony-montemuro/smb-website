/* ===== IMPORTS ===== */
import "./SignIn.css";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "../../database/SupabaseClient";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";

function SignIn() {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== EFFECTS ===== */

  // code that is executed each time the user context state is updated
  useEffect(() => {
    if (user.id) {
      navigate("/profile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ===== SIGN IN COMPONENT ===== */
  return (
    <div className="signin">

      { /* Sign in left: render the sign in form (left 35% of screen) */ }
      <div className="signin-left">
        <h2>SMB Elite</h2>
        <Auth 
          supabaseClient={ supabase }
          appearance={ { 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'blue',
                  brandAccent: 'darkblue',
                },
              },
            }
          } }
          providers={[]}
        />
      </div>

      { /* Sign in right: render a fancy image (right 65% of screen) */ }
      <div className="signin-right">
        <h1>&lt;insert image here&gt;</h1>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SignIn;