/* ===== IMPORTS ===== */
import { useEffect, useState } from "react";
import styles from "./StatsDirectory.module.css";
import Container from "../../Container/Container.jsx";
import Items from "../../Items/Items.jsx";
import StatsDirectoryLogic from "./StatsDirectory.js";
import CategoryMenu from "./CategoryMenu";

function StatsDirectory({ imageReducer, profile }) {
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
      </Container>
    </div>
};

/* ===== EXPORTS ===== */
export default StatsDirectory;