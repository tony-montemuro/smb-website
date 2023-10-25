/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./GameModerators.module.css";
import Container from "../../components/Container/Container.jsx";
import Delete from "./Popups/Delete.jsx";
import GameModeratorsLogic from "./GameModerators.js";
import Insert from "./Popups/Insert.jsx";
import Items from "../../components/Items/Items.jsx";
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
  const WIDTH = "600px";

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    queryGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* ===== GAME MODERATOR COMPONENT ===== */
  return game && games &&
    <div className={ styles.gameModerators }>

      { /* Popups */ }
      <Popup renderPopup={ moderatorToRemove } setRenderPopup={ setModeratorToRemove } width={ WIDTH }>
        <Delete submitting={ submitting } onDelete={ removeModerator } />
      </Popup>
      <Popup renderPopup={ moderatorToAdd } setRenderPopup={ setModeratorToAdd } width={ WIDTH }>
        <Insert submitting={ submitting } onInsert={ addModerator } />
      </Popup>

      { /* Simple game select - render a column of games to select from */ }
      <div className={ styles.left }>
        <SimpleGameSelect
          games={ games }
          game={ game }
          setGame={ setGame }
          imageReducer={ imageReducer }
        />
      </div>

      { /* Game moderators current - render both the list of current moderators, and a user search to add new moderators */ }
      <div className={ styles.content }>
        <Container title={ game.name } largeTitle>

          { /* Section #1: render the current moderators for the particular game, and allow administrator to remove if needed */ }
          <h2>Current Moderators</h2>
          <Items items={ game.moderators } emptyMessage="This game has no moderators! You should add at least one.">
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
          </Items>

          <hr />

          { /* Section #2: render the list of users to search through, and allow administrator to add if needed */ }
          <h2>Add New Moderator</h2>
          <p>Select a user to add them as a moderator.</p>
          <UserSearch usersPerPage={ USERS_PER_PAGE } userRowOptions={ options } />

        </Container>
      </div>

    </div>;
};

/* ===== EXPORTS ===== */
export default GameModerators;