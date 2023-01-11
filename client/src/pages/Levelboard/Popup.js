import "./levelboard.css";
import React from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

function Popup({ board, setBoard }) {
    // function to remove a record
    const remove = async() => {
      try {
        const { error } = await supabase
          .from( `${ board.delete.mode }_submission` )
          .delete()
          .match({ user_id: board.delete.user_id, game_id: board.delete.game_id, level_id: board.delete.level_id });

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
    board.delete ? 
      board.delete.user_id === supabase.auth.user().id ?
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
            <h2>Are you sure you want to remove your submission?</h2>
            <button onClick={ () => remove() }>Yes</button>
            <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div> 
        </div>
      :
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
              <h2>Are you sure you want to remove the following { board.delete.mode }
              : { board.delete.mode === "score" ? board.delete.score : board.delete.time } by { board.delete.name }?</h2>
              <button onClick={ () => remove() }>Yes</button>
              <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div>
        </div> 
    :
      null
  );
};

export default Popup;