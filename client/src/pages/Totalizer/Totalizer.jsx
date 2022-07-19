import "./totalizer.css";
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import TotalizerInit from './TotalizerInit';

function Totalizer() {
    const { title, isMisc, checkPath, getTotalizer, getLinkBack, getLinkToMedal, TotalizerBoard } = TotalizerInit();

    useEffect(() => {
        checkPath();
        getTotalizer(true);
        getTotalizer(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);  
  return (
    <div className="totalizer">
        <div className="totalizer-header">
            <h1>{isMisc ? "Miscellaneous "+title : title} Totalizer</h1>
        </div>
        <Link to={getLinkBack()}>
          <button>Back to {title}'s Page</button>
        </Link>
        <Link to={getLinkToMedal()}>
          <button>{isMisc ? "Miscellaneous "+title : title}'s Medal Table Page</button>
        </Link>
        <div className="totalizer-body">
            <TotalizerBoard isScore={true} />
            <TotalizerBoard isScore={false} />
        </div>
    </div>
  )
}

export default Totalizer