import "./levelboard.css";
import React, { useState } from "react";
import { supabase } from "../../database/SupabaseClient";
import LevelboardDelete from "../../database/delete/LevelboardDelete";
// import LevelboardUpdate from "../../database/update/LevelboardUpdate";

function Popup({ board, setBoard }) {
  /* ===== VARIABLES ===== */
  const user = supabase.auth.user();

  /* ===== STATES ===== */
  const [form, setForm] = useState({ message: "", error: null });

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { deleteSubmission } = LevelboardDelete();
  // const { insertNotification } = LevelboardUpdate();

  // function that is called when a user deletes their own run
  const handleDelete = async () => {
    // await the removal of the submission
    await deleteSubmission(board.delete.id);

    // reload the page once that is done
    window.location.reload();
  };

  // function that is called when a moderator is deleting a run from another user
  const handleModDelete = async () => {
    // first, verify that the message is not more than { max } characters
    // const max = 100;
    // if (form.message.length > max) {
    //   setForm({ ...form, error: `Error: Messages must be less than ${ max } characters.` });
    //   return;
    // }

    // await the removal of the submission
    await deleteSubmission(board.delete.id);

    // ===== NOTIFICATIONS ARE BEING TOTALLY REHAULED -> COMMENT ALL THIS OUT FOR NOW ===== //
    // if (status) {
    //   await insertNotification({
    //     user_id: board.delete.user_id,
    //     game_id: board.delete.game_id,
    //     level_id: board.delete.level_id,
    //     mod_id: user.id,
    //     type: board.delete.type,
    //     notif_type: "delete",
    //     message: form.message,
    //     record: board.record
    //   });
    //   window.location.reload();
    // }
    window.location.reload();
  };

  // popup component
  return (
    board.delete ? 
      board.delete.user_id === user.id ?
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
            <h2>Are you sure you want to remove your submission?</h2>
            <button onClick={ handleDelete }>Yes</button>
            <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div> 
        </div>
      :
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
              <h2>Are you sure you want to remove the following { board.delete.type }: { board.delete.record } by { board.delete.username }?</h2>
              <form>
                <label>Leave a message: </label>
                <input 
                  type="text"
                  value={ form.message }
                  onChange={ e => setForm({ error: null, message: e.target.value }) }
                />
                { form.error ? <p>{ form.error }</p> : null }
              </form>
              <button onClick={ handleModDelete }>Yes</button>
              <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div>
        </div> 
    :
      null
  );
};

export default Popup;