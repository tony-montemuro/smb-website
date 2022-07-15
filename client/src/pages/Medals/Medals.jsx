import "./medals.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import MedalsInit from './Medalsinit';

function Medals() {
    const { title, checkPath, getMedalTable, getLinkBack, getLinkToTotals, MedalsBoard } = MedalsInit();

    useEffect(() => {
        checkPath();
        getMedalTable(true);
        getMedalTable(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  
  return (
    <div className="medals">
        <div className="medals-header">
            <h1>{title} Medal Table</h1>
        </div>
        <Link to={getLinkBack()}>
          <button>Back to {title}'s Page</button>
        </Link>
        <Link to={getLinkToTotals()}>
          <button> { title }'s Totalizer Page</button>
        </Link>
        <div className="medals-body">
            <MedalsBoard isScore={true} />
            <MedalsBoard isScore={false} />
        </div>
    </div>
  )
}

export default Medals