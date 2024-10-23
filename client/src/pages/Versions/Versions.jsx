/* ===== IMPORTS ===== */
import { useEffect } from "react";
import styles from "./Versions.module.css";
import Container from "../../components/Container/Container.jsx";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect";
import VersionsLogic from "./Versions.js";
import Loading from "../../components/Loading/Loading.jsx";

function Versions({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */
  const { game, games, setGame, queryGames } = VersionsLogic();

  /* ===== EFFECTS ===== */

  // code that is executed on component mount
  useEffect(() => {
    queryGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== VERSIONS COMPONENT ===== */
  return (
    <div className={ styles.versions }>
      <div className={ styles.left }>
        <SimpleGameSelect
          games={ games }
          game={ game }
          setGame={ setGame } 
          imageReducer={ imageReducer }
        />
      </div>

      <div className={ styles.right }>
        <Container title="Versions" largeTitle>
          { game ?
            <div>
              <h3>On this screen, you are able to add new versions to a game.</h3>
              <span>{ game.name } has { game.version.length } versions.</span>
            </div>
          :
            <Loading />
          }
        </Container>
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Versions;