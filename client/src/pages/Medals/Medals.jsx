import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import Board from "./Board";
import MedalsInit from './Medalsinit';

function Medals() {
    const { title,
            validPath,
            isMisc, 
            scoreMedals,
            timeMedals,
            checkPath, 
            getMedalTable, 
            getLinkBack, 
            getLinkToTotals
    } = MedalsInit();

    useEffect(() => {
        checkPath();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  

      useEffect(() => {
        if (validPath) {
          getMedalTable(true);
          getMedalTable(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [validPath]);  
      
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
            <Board data={scoreMedals} />
          </div>
          <div className="medals-container">
            <h2>Time Medal Table</h2>
            <Board data={timeMedals} />
          </div>
        </div>
    </div>
  )
}

export default Medals