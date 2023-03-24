/* ===== IMPORTS ===== */
import "./UserStats.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext, useEffect, useState } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import UserStatsLogic from "./UserStats.js";

function UserStats({ submissionReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");
  const userId = path[2];
  const abb = path[3];
  const category = path[4];

  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [type, setType] = useState("score");

  // hooks and functions from the js file
  const { 
    stats,
    fetchUserStats
  } = UserStatsLogic();

  // helper functions
  const { capitalize, cleanLevelName, dateB2F, recordB2F, secondsToHours } = FrontendHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the page loads, when the staticCache object is updated
  useEffect(() => {
    if (staticCache.games.length > 0 && staticCache.profiles.length > 0) {
      // see if abb corresponds to a game stored in cache, and if userId corresponds to a profile stored in cache
      const games = staticCache.games, profiles = staticCache.profiles;
      const game = games.find(row => row.abb === abb);
      const profile = profiles.find(row => row.id === userId);

      // if either do not match, handle the error, and navigate to the home screen
      if (!game || !profile) {
        !game && console.log("Error: Invalid game.");
        !profile && console.log("Error: Invalid user.");
        navigate("/");
        return;
      }

      // otherwise, update the game & user state hooks, and fetch user stats
      setGame(game);
      setUser(profile);
      fetchUserStats(path, game, submissionReducer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== USER STATS COMPONENT ===== */
  return game && user && stats ?
    <>
      <div className="stats-header">

        { /* User and game title */ }
        <h1>{ user.username }: { game.name }</h1>

        { /* Return to user page button */ }
        <Link to={ `/user/${ user.id }` }>
          <button>Back to { user.username }'s Profile</button>
        </Link>

        { /* Type radio buttons */ }
        <div className="stats-radio">

          { /* Score radio button */ }
          <label htmlFor="score">Score:</label>
          <input 
            id="score"
            type="radio" 
            value="score"
            checked={ type === "score" }
            onChange={ (e) => setType(e.target.value) }>
          </input>

          { /* Time radio button */ }
          <label htmlFor="time">Time:</label>
          <input 
            id="score"
            type="radio" 
            value="time"
            checked={ type === "time" }
            onChange={ (e) => setType(e.target.value) }>
          </input>

        </div>
      </div>

      { /* Stats body */ }
      <div className="stats-body">

        { /* Display the type */ }
        <h1>{ capitalize(type) }</h1>

        { /* Stats table */ }
        <div className="stats-table">
          <h2>{ capitalize(type) } Total</h2>

          { /* If the total field exists... */ }
          { stats[type].totals ?

            // Render a table displaying the user's total
            <table>

              { /* Table header - shows what information is rendered in each cell */ }
              <thead>
                <tr>
                  <th>Position</th>
                  <th>{ capitalize(type) } Total</th>
                </tr>
              </thead>

              { /* Table body - Render the information itself */ }
              <tbody>
                <tr>

                  { /* Element 1 - Position */ }
                  <td>{ stats[type].totals.position }</td>
                  
                  { /* Element 2: Total */ }
                  <td>{ secondsToHours(stats[type].totals.total, type) }</td>

                </tr>
              </tbody>

            </table>
          :

            // If there is no total, render this message instead.
            <p><i>This user has not submitted to this category.</i></p>
          }
        </div>

        { /* Stats table */ }
        <div className="stats-table">
          <h2>{ capitalize(type) } Medals</h2>

          { /* If the medals field exists... */ }
          { stats[type].medals ?

            // Render a table displaying the user's medals
            <table>

              { /* Table header - shows what information is rendered in each cell */ }
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Platinum</th>
                  <th>Gold</th>
                  <th>Silver</th>
                  <th>Bronze</th>
                </tr>
              </thead>

              { /* Table body - Render the information itself */ }
              <tbody>
                <tr>

                  { /* Element 1 - Position */ }
                  <td>{ stats[type].medals.position }</td>

                  { /* Element 2 - Platinum */ }
                  <td>{ stats[type].medals.platinum }</td>

                  { /* Element 3 - Gold */ }
                  <td>{ stats[type].medals.gold }</td>

                  { /* Element 4 - Silver */ }
                  <td>{ stats[type].medals.silver }</td>

                  { /* Element 5 - Bronze */ }
                  <td>{ stats[type].medals.bronze }</td>

                </tr> 
              </tbody>

            </table>
          :
            // If there is no medals, render this message instead.
            <p><i>This user has not submitted to this category.</i></p>
          }
        </div>

        { /* Stats records */ }
        <div className="stats-records">
          <h2>Best { capitalize(type) }s</h2>

          { /* For each mode, we want to render a rankings table */ }
          { Object.keys(stats[type].rankings).map(mode => {
            return (

              // Records table 
              <table key={ mode }>

                { /* Table Header - shows what information is rendered in each cell */ }
                <thead>
                  <tr>
                    <th colSpan={ 4 }>{ cleanLevelName(mode) }</th>
                  </tr>
                  <tr>
                    <th>Level Name</th>
                    <th>{ capitalize(type) }</th>
                    <th>Position</th>
                    <th>Date</th>
                  </tr>
                </thead>

                { /* Table body - Renders the information itself */ }
                <tbody>
                  { stats[type].rankings[mode].map(level => {
                    return (
                      <tr key={ level.level }>

                        { /* Element 1 - Level name [which includes a link to the chart] */ }
                        <td>
                          <Link
                            to={ { pathname: `/games/${ abb }/${ category }/${ type }/${ level.level }` } }
                            className="stats-records-links"
                          >
                            { cleanLevelName(level.level) }
                          </Link>
                        </td>

                        { /* Element 2 - Record */ }
                        <td>{ recordB2F(level.record, type) }</td>

                        { /* Element 3 - Position */ }
                        <td>{ level.position }</td>

                        { /* Element 4 - Submission date */ }
                        <td>{ level.date ? dateB2F(level.date) : level.date }</td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            );
          })}
        </div>
      </div>
    </>
  :

    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default UserStats;