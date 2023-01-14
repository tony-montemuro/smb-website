import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import MedalsInit from './Medalsinit';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Medals({ cache }) {
  // variables
  const imgLength = 50;

  // hooks and functions from init file
  const { 
    game,
    loading,
    medals,
    setLoading,
    generateMedals
  } = MedalsInit();

  // helper functions
  const { capitalize } = FrontendHelper();

  // code that is executed either or page load, or when the game state is updated
  useEffect(() => {
    if (cache.games) {
      generateMedals('score', cache.games, cache.scoreSubmissionState);
      generateMedals('time', cache.games, cache.timeSubmissionState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache.games]);

  // once both medal tables have been generated, loading state hook is set to false
  useEffect(() => {
    if (medals.score && medals.time) {
      setLoading(false);
      console.log(medals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medals]);  
      
  // medals component
  return (
    <>
      <div className="medals-header">
        <h1>{ game.isMisc ? "Miscellaneous " + game.name : game.name } Medal Table</h1>
        <Link to={ `/games/${ game.abb }` }>
          <button>Back to { game.name }'s Page</button>
        </Link>
        <Link to={ `/games/${ game.abb }/${ game.isMisc ? "misc" : "main" }/totalizer` }>
          <button> { game.isMisc ? "Miscellaneous " + game.name : game.name }'s Totalizer Page</button>
        </Link>
      </div>
      <div className="medals-body">
        { Object.keys(medals).map(mode => {
          return (
            <div key={ mode } className="medals-container">
              <h2>{ capitalize(mode) } Medal Table</h2>
              { loading ?
                <p>Loading...</p>
              :
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Name</th>
                      <th>Platinum</th>
                      <th>Gold</th>
                      <th>Silver</th>
                      <th>Bronze</th>
                    </tr>
                  </thead>
                  <tbody>
                    { medals[mode].length === 0 ?
                      <tr>
                        <td colSpan={ 6 } className="medals-empty">There have been no live submissions to this game's category!</td>
                      </tr>
                    :
                      medals[mode].map(row => {
                        return (
                          <tr key={ `${ row.name }-row` }>
                            <td>{ row.position }</td>
                            <td>
                                <div className="medals-user-info">
                                    <div className="medals-user-image"><SimpleAvatar url={ row.avatar_url } size={ imgLength } /></div>
                                    { row.country ?
                                      <div><span className={ `fi fi-${ row.country.toLowerCase() }` }></span></div>
                                    :
                                      null
                                    }
                                    <div><Link to={ `/user/${ row.user_id }` }>{ row.name }</Link></div>
                                </div>
                            </td>
                            <td>{ row.platinum }</td>
                            <td>{ row.gold }</td>
                            <td>{ row.silver }</td>
                            <td>{ row.bronze }</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              }
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Medals;