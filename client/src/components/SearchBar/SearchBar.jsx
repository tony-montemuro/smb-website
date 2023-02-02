import "./searchbar.css";
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function SearchBar({ game, levels}) {
  // states
  const [filtered, setFiltered] = useState([]);

  // refs
  const searchRef = useRef(null);

  // functions

  // helper functions
  const { cleanLevelName } = FrontendHelper();

  // function that will update the filter state each time the user changes their search
  const handleFilter = (word) => {
    if (word.length > 0) {
      const newFilter = levels.filter((row) => {
        return cleanLevelName(row.name).toLowerCase().includes(word.toLowerCase());
      });
      setFiltered(newFilter);
    } else {
      setFiltered([]);
    }
  };

  // function that clears the search
  const clearSearch = () => {
    searchRef.current.value = "";
    handleFilter("");
  };

  // search bar component
  return (
    <div className="searchbar">
      <div className="searchbar-inputs-container">
        <input 
          className="searchbar-input"
          type="text"
          ref={ searchRef }
          placeholder="Search for level..."
          onChange={ (e) => handleFilter(e.target.value) }
        />
        <div className="searchbar-icon">
          { filtered.length === 0 ? <>🔍</> : <button className="searchbar-clear" onClick={ clearSearch }>❌</button> }
        </div>
      </div>
      { filtered.length > 0 && (
        <div className="searchbar-results">
          { filtered.slice(0, 10).map((level) => {
            return (
              <div className="searchbar-item">
                <span className="searchbar-item-name">{ cleanLevelName(level.name) }</span>
                { level.chart_type === "score" || level.chart_type === "both" ?
                  <Link to={ `/games/${ game }/${ level.misc ? "misc" : "main" }/score/${ level.name }` }>
                    <button>Score</button>
                  </Link>
                :
                  <span className="searchbar-item-empty"></span>
                }
                { level.chart_type === "time" || level.chart_type === "both" ?
                  <Link to={ `/games/${ game }/${ level.misc ? "misc" : "main" }/time/${ level.name }` }>
                    <button>Time</button>
                  </Link>
                :
                  <span className="searchbar-item-empty"></span>
                }
              </div>
            );
          })}
        </div> 
      )}
    </div>
  )
};

export default SearchBar;