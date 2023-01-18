import "./levelboard.css";
import React from "react";
import { supabase } from "../../database/SupabaseClient";
import LevelboardDelete from "../../database/delete/LevelboardDelete";

function Popup({ board, setBoard }) {
  // helper functions
  const { remove } = LevelboardDelete();

  // popup component
  return (
    board.delete ? 
      board.delete.user_id === supabase.auth.user().id ?
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
            <h2>Are you sure you want to remove your submission?</h2>
            <button onClick={ () => remove(board.delete) }>Yes</button>
            <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div> 
        </div>
      :
        <div className="levelboard-popup">
          <div className="levelboard-popup-inner">
              <h2>Are you sure you want to remove the following { board.delete.mode }
              : { board.delete.mode === "score" ? board.delete.score : board.delete.time } by { board.delete.name }?</h2>
              <button onClick={ () => remove(board.delete) }>Yes</button>
              <button onClick={ () => setBoard({ ...board, delete: null }) }>No</button>
          </div>
        </div> 
    :
      null
  );
};

export default Popup;