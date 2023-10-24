/* ===== IMPORTS ===== */
import styles from "./SimpleGameSelect.module.css";
import Container from "../Container/Container.jsx";
import GameRow from "../GameRow/GameRow.jsx";

function SimpleGameSelect({ games, game, setGame, imageReducer, countType = null }) {
  /* ===== SIMPLE GAME SELECT COMPONENT ===== */
  return (
    <div className={ styles.simpleGameSelect }>
      <Container title="Games" largeTitle>

        { /* For each game that the user moderates, render a game row that will update the administrator view when clicked */ }
        <div className={ styles.tabs }>
          { games.map((gameObj, index) => {
            const num = countType && gameObj[countType];
            return (
              <GameRow 
                game={ gameObj }
                imageReducer={ imageReducer }
                onClick={ setGame }
                index={ index }
                extraContent={ num ? `(${ num })` : undefined }
                selectedGame={ game.abb }
                key={ gameObj.abb }
              />
            );
          })}
        </div>
      </Container>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SimpleGameSelect;