import "./levelboard.css";
import React, { useState } from "react";
import { supabase } from "../../database/SupabaseClient";
import LevelboardDelete from "../../database/delete/LevelboardDelete";
import LevelboardHelper from "../../helper/LevelboardHelper";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";

function DeletePopup({ board, setBoard }) {
  /* ===== VARIABLES ===== */
  const user = supabase.auth.user();

  /* ===== STATES ===== */
  const [form, setForm] = useState({ message: "", error: null });

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { remove } = LevelboardDelete();
  const { validateMessage } = LevelboardHelper();
  const { insertNotification } = LevelboardUpdate();

  // function that is called when a user deletes their own run
  const handleDelete = async () => {
    // await the removal of the submission
    await remove(board.delete.id);

    // reload the page once that is done
    window.location.reload();
  };

  // function that is called when a moderator is deleting a run from another user
  const handleModDelete = async () => {
    // first, verify that the message is valid
    const error = validateMessage(form.message, false);
    if (error) {
      setForm({ ...form, error: error });
      return;
    }

    // await the removal of the submission
    await remove(board.delete.id);

    // await the insertion of the delete notification
    const notification = { 
      notif_type: "delete",
      user_id: board.delete.user_id,
      creator_id: user.id,
      message: form.message,
      game_id: board.delete.game_id,
      level_id: board.delete.level_id,
      score: board.delete.type === "score" ? true : false,
      record: board.delete.record
    };
    await insertNotification(notification);
    
    // reload page
    window.location.reload();
  };

  // deletepopup component
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

export default DeletePopup;