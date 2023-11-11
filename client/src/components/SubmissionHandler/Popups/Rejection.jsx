/* ===== IMPORTS ===== */
import { PopupContext, UserContext } from "../../../utils/Contexts.js";
import { useContext, useEffect, useRef } from "react";
import styles from "./Submission.module.css";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

function Rejection({ form, clearMessage, handleChange, setShowReject, onReject }) {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== REFS ===== */
  const rejectionRef = useRef(null);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  const isOwn = submission.profile.id === user.profile.id;
  const MESSAGE_MAX_LENGTH = 100;
  const MESSAGE_ROWS = 2;

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    // must use `setTimeout` as a hacky solution to get scroll behavior working
    const timer = setTimeout(() => {
      rejectionRef.current.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(timer); 
  }, []);

  /* ===== REJECTION COMPONENT ===== */
  return (
    <div ref={ rejectionRef } className={ styles.rejection }>

      <hr />

      { /* Render information about rejections */ }
      <div className={ styles.rejectionHeader }>
        <h2>
          { isOwn ?
            `Are you sure you want to reject your own submission?`
          :
            `Are you sure you want to reject this submission?`
          }
        </h2>
        <span><em>Note:</em> Rejecting a submission means deleting it!</span>
      </div>

      <form>
        <div className={ styles.formWrapper }>

          { /* Message: Render a textbox allowing the user to add a message, if the submission does not belong to current user. */ }
          { !isOwn &&
            <TextField
              fullWidth
              id="message"
              inputProps={ { maxLength: MESSAGE_MAX_LENGTH } }
              InputProps={ { 
                endAdornment: form.values.message.length > 0 ? (
                  <IconButton size="small" onClick={ clearMessage }>
                    <ClearRoundedIcon />
                  </IconButton>
                ) : undefined
              } }
              label="Message"
              multiline
              placeholder="Must be under 100 characters"
              rows={ MESSAGE_ROWS }
              onChange={ handleChange }
              value={ form.values.message }
              variant="filled"
            />
          }

          { /* Two buttons: one for cancellation, and one for rejection. */ }
          <div className={ styles.btns }>
            <button type="button" className="cancel" onClick={ () => setShowReject(false) }>Cancel</button>
            <button type="submit" onClick={ (e) => onReject(e) }>Reject</button>
          </div>

        </div>
      </form>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Rejection;