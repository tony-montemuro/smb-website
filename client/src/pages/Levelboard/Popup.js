import "./popup.css";
import React from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

function Popup({ trigger, setTrigger, mode, playerInfo, removeFunc }) {
  return (
    trigger ? 
      playerInfo.user_id === supabase.auth.user().id ?
      <div className="popup">
        <div className="popup-inner">
          <h2>Are you sure you want to remove your submission?</h2>
          <button onClick={ () => removeFunc(playerInfo.user_id, {}) }>Yes</button>
          <button onClick={ () => setTrigger(false) }>No</button>
        </div> 
      </div>
      :
      <div className="popup">
        <div className="popup-inner">
            <h2>Are you sure you want to remove the following {mode.toLowerCase()}
            : {mode === "Score" ? playerInfo.Score : playerInfo.Time} by {playerInfo.Name}.</h2>
            <p><i>Remember to review the record if you choose to delete it!</i></p>
            <button onClick={ () => removeFunc(playerInfo.user_id, { record: mode === "Score" ? playerInfo.Score : playerInfo.Time, isLive: playerInfo.live }) }>Yes</button>
            <button onClick={ () => setTrigger(false) }>No</button>
        </div>
      </div> 
    :
    ""
  );
}

export default Popup;