import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import MedalsInit from './Medalsinit';

function Medals() {
    const { title,
            loading,
            scoreLoading,
            timeLoading,
            isMisc, 
            scoreMedals,
            timeMedals,
            setLoading,
            medalTableQuery,
            getLinkBack, 
            getLinkToTotals
    } = MedalsInit();

    useEffect(() => {
        medalTableQuery("score");
        medalTableQuery("time");
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  

      useEffect(() => {
        if (!scoreLoading && !timeLoading) {
          setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [scoreLoading, timeLoading]);  
      
  return (
    <div className="medals">
        <div className="medals-header">
            <h1>{ isMisc ? "Miscellaneous "+title : title } Medal Table</h1>
        </div>
        <Link to={getLinkBack()}>
          <button>Back to { title }'s Page</button>
        </Link>
        <Link to={getLinkToTotals()}>
          <button> { isMisc ? "Miscellaneous " + title : title }'s Totalizer Page</button>
        </Link>
        <div className="medals-body">
          <div className="medals-container">
            <h2>Score Medal Table</h2>
            <Board data={ scoreMedals } loading={ loading } />
          </div>
          <div className="medals-container">
            <h2>Time Medal Table</h2>
            <Board data={ timeMedals } loading={ loading } />
          </div>
        </div>
    </div>
  )
}

export default Medals