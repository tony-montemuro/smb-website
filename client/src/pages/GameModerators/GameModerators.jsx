/* ===== IMPORTS ===== */
import "./GameModerators.css";
import { useEffect, useState } from "react";
import Delete from "./Delete";
import GameModeratorsLogic from "./GameModerators.js";
import Insert from "./Insert";
import Popup from "../../components/Popup/Popup.jsx";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect.jsx";
import UserRow from "../../components/UserRow/UserRow.jsx";
import UserSearch from "../../components/UserSearch/UserSearch.jsx";

function GameModerators({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const [moderatorToRemove, setModeratorToRemove] = useState(undefined);
  const [moderatorToAdd, setModeratorToAdd] = useState(undefined);

  // states and functions from the js file
  const { game, games, submitting, setGame, queryGames, removeModerator, addModerator } = GameModeratorsLogic();

  /* ===== VARIABLES ===== */
  const options = {
    disableLink: true,
    isDetailed: false,
    onUserRowClick: setModeratorToAdd
  };
  const USERS_PER_PAGE = 20;

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    queryGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* ===== GAME MODERATOR COMPONENT ===== */
  return game && games &&
    <div className="game-moderators">

      { /* Popups */ }
      <Popup renderPopup={ moderatorToRemove } setRenderPopup={ setModeratorToRemove } width="30%">
        <Delete submitting={ submitting } onDelete={ removeModerator } />
      </Popup>
      <Popup renderPopup={ moderatorToAdd } setRenderPopup={ setModeratorToAdd } width="30%">
        <Insert submitting={ submitting } onInsert={ addModerator } />
      </Popup>

      { /* Simple game select - render a column of games to select from */ }
      <SimpleGameSelect
        games={ games }
        game={ game }
        setGame={ setGame }
        imageReducer={ imageReducer }
      />

      { /* Game moderators current - render both the list of current moderators, and a user search to add new moderators */ }
      <div className="game-moderators-content">
        <h1>Game Moderators</h1>

        { /* Render list of all current moderators */ }
        <div className="game-moderators-container">
          <h2>Current Moderators</h2>

          { /* If at least 1 moderator exists, render it */ }
          { game.moderators.length > 0 ?

            <div className="game-moderators-list">
              <p>Select a moderator to remove them.</p>
              { game.moderators.map(moderator => {
                return (
                  <UserRow  
                    user={ moderator }
                    onClick={ setModeratorToRemove }
                    disableLink
                  />
                );
              })}
            </div>
          :

          // Otherwise, render message to admin that they should add some
          <p className="game-moderators-current-empty">This game has no moderators! You should at at least one.</p> 
          }

        </div>

        { /* Render the ability to search for users to add them as moderators */ }
        <div className="game-moderators-container">
          <h2>Add New Moderator</h2>
          <p>Select a user to add them as a moderator.</p>
          <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ options } />
        </div>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default GameModerators;