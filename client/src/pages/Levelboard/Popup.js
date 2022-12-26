import "./popup.css";
import React from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

function Popup({ trigger, setTrigger, recordInfo }) {
    // function to remove a record
    const remove = async() => {
        try {
            const { error } = await supabase
                .from(`${recordInfo.mode}_submission`)
                .delete()
                .match({ user_id: recordInfo.user_id, game_id: recordInfo.game_id, level_id: recordInfo.level_id });

            // error handling
            if (error) {
                throw (error);
            }

            // if successful, reload the page
            window.location.reload();
        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

  return (
    trigger ? 
      recordInfo.user_id === supabase.auth.user().id ?
      <div className="popup">
        <div className="popup-inner">
          <h2>Are you sure you want to remove your submission?</h2>
          <button onClick={ () => remove() }>Yes</button>
          <button onClick={ () => setTrigger(false) }>No</button>
        </div> 
      </div>
      :
      <div className="popup">
        <div className="popup-inner">
            <h2>Are you sure you want to remove the following { recordInfo.mode }
            : { recordInfo.mode === "score" ? recordInfo.score : recordInfo.time } by { recordInfo.name }.</h2>
            <button onClick={ () => remove() }>Yes</button>
            <button onClick={ () => setTrigger(false) }>No</button>
        </div>
      </div> 
    :
    ""
  );
}

export default Popup;