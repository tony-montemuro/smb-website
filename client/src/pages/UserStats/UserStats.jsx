import "./userstats.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import UserStatsInit from "./UserStatsInit";
import StatsBoard from "./StatsBoard";

function UserStats() {
    const { loading,
      title, 
      user, 
      medals, 
      totals, 
      medalsMisc, 
      totalsMisc, 
      selectedRadioBtn,
      setLoading, 
      checkPath, 
      queryMedalsAndTotals, 
      sortData,
      checkForData,
      isRadioSelected,
      handleRadioClick } = UserStatsInit();

    useEffect(() => {
      if (loading && (medals.length === 2 && totals.length === 2 && medalsMisc.length === 2 && totalsMisc.length === 2)) {
        setLoading(false);
        sortData(true, true);
        sortData(true, false);
        sortData(false, true);
        sortData(false, false);
        checkForData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [medals, totals, medalsMisc, totalsMisc]);

    useEffect(() => {
        checkPath();
        queryMedalsAndTotals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

  return (
    loading ?
    <p>Loading...</p>
    :
    <div className="page">
      <div className="user-stats-header">
        <h1>{ user.username }'s { title } Page</h1>
        <Link to={`/user/${user.id}`}>
          <button>Back to { user.username }'s Profile</button>
        </Link>
      </div>
      <div className="misc-select">
        <label htmlFor="main">Main Charts</label>
        <input 
          id="main"
          type="radio"
          name="main"
          value="main"
          checked={ isRadioSelected("main") }
          onChange={ handleRadioClick } 
        />
        <label htmlFor="misc">Miscellaneous Charts</label>
        <input 
          id="misc"
          type="radio"
          name="misc"
          value="misc"
          checked={ isRadioSelected("misc") }
          onChange={ handleRadioClick } 
        />
      </div>
      {selectedRadioBtn === "main" ? 
      <div className="stats-board">
        <StatsBoard total={ totals[0] } medals={ medals[0] } user={ user } />
        <StatsBoard total={ totals[1] } medals={ medals[1] } user={ user } />
      </div>
      :
      <div className="stats-board">
        <StatsBoard total={ totalsMisc[0] } medals={ medalsMisc[0] } user={ user } />
        <StatsBoard total={ totalsMisc[1] } medals={ medalsMisc[1] } user={ user } />
      </div>
      }
    </div>
  );
}

export default UserStats;