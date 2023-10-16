/* ===== IMPORTS ===== */
import { ProfileContext } from "../../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import styles from "./StatsDirectory.module.css";
import Container from "../../Container/Container.jsx";
import Items from "../../Items/Items.jsx";
import StatsDirectoryLogic from "./StatsDirectory.js";
import CategoryMenu from "./CategoryMenu";

function StatsDirectory({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // profile state from profile context
  const { profile } = useContext(ProfileContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [selectedGame, setSelectedGame] = useState(undefined);

  // states & functions from the js file
  const { userGames, initUserGames } = StatsDirectoryLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts, or when the profile state updates
  useEffect(() => {
    initUserGames(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  /* ===== USER OVERVIEW COMPONENT ===== */
  return userGames &&
    <div className={ styles.statsDirectory }>
      <Container title="Submissions" largeTitle>
        <div className={ styles.body }>
          <Items items={ userGames.main.concat(userGames.custom) } emptyMessage="This user has no submissions to any game.">
            { Object.keys(userGames).map(type => {
              return (
                <CategoryMenu
                  type={ type }
                  games={ userGames[type] }
                  selectedGame={ selectedGame }
                  setSelectedGame={ setSelectedGame }
                  imageReducer={ imageReducer }
                  key={ type }
                />
              );
            })}
          </Items>
        </div>
      </Container>
    </div>
};

/* ===== EXPORTS ===== */
export default StatsDirectory;