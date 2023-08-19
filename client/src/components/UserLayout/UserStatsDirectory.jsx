/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import BoxArt from "../BoxArt/BoxArt.jsx";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import UserStatsCategory from "./UserStatsCategory";
import UserStatsDirectoryLogic from "./UserStatsDirectory.js";

function UserStatsDirectory({ imageReducer, profile }) {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [selectedGame, setSelectedGame] = useState(undefined);

  // states & functions from the js file
  const { userGames, initUserGames } = UserStatsDirectoryLogic();

  // helper functions
  const { getGameCategories } = GameHelper();
  const { capitalize } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component first mounts, or when the profile state updates
  useEffect(() => {
    initUserGames(staticCache.games, profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  /* ===== USER STATS DIRECTORY COMPONENT ===== */
  return userGames &&
    <div className="user-layout-stats">
      
      { /* Title */ }
      <h1>View Player Statistics</h1>

      { /* User layout stats menu */ }
      <div className="user-layout-stats-menus">
        { /* Actually render stats select menus if the user has any main or custom games they have submitted to. */ }  
        { userGames.main || userGames.custom ?

          // Render a stat select menu for each key of the object
          Object.keys(userGames).map(type => {
            return (
              <div className="user-layout-stats-menu" key={ type }>
    
                { /* User stats select menu header */ }
                <h2>{ capitalize(type) } Games</h2>
    
                { /* User stats select menu body will render a dynamic number of rows, depending on the number of { type } userGames. */ }
                { /* Each row contains: a game, it's box art, and links to stats for each game category */ }
                <div className="user-layout-stats-menu-body">
                  { userGames[type].map(game => {
                    return (
                      <div className="user-layout-stats-row" key={ game.abb }>

                        { /* First, render the game and it's box art. */ }
                        <div className="user-layout-game-element" onClick={ () => setSelectedGame(game.abb !== selectedGame ? game.abb : undefined) }>
                          <div className="user-layout-game-element">
                            <BoxArt game={ game } imageReducer={ imageReducer } width={ 75 } />
                            <h3>{ game.name }</h3>
                          </div>
                          { game.abb === selectedGame ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon /> }
                        </div>
    
                        { /* Now, render the user stats category component for the selected game's category */ }
                        { game.abb === selectedGame && getGameCategories(game).map(category => {
                          return <UserStatsCategory game={ game } category={ category } key={ `${ game.abb }_${ category }` } />;
                        })}

                      </div>
                    );
                  })}
                </div>
    
              </div>
            );
          })

        :
          // Otherwise, render a message letting the user know that this user has no submissions.
          <p>This user has no submissions to any game.</p>
        }
        
      </div>

    </div> 
};

/* ===== EXPORTS ===== */
export default UserStatsDirectory;