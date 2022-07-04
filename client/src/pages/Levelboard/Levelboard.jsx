// styling
import "./levelboard.css";

// js imports
import React from "react";
import LevelboardInit from "./LevelboardInit";
import Board from "./Board";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Levelboard({ session }) {
  const { loading,
          records,
          title, 
          formValues, 
          formErrors,
          isSubmit,
          checkPath, 
          getTitleAndRecords, 
          getMonkeys,
          submitValues,
          handleChange,
          swapLevels, 
          handleSubmit,
          getGame, 
          getMode, 
          setLevelId, 
          MonkeySelect
  } = LevelboardInit();

  useEffect(() => {
    checkPath();
    getTitleAndRecords();
    getMonkeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if there are no errors, and isSubmit is set to true, then submit the form values
    // to database
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      submitValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formErrors]);

  return (
    <div className="levelboard">
      {loading ? 
        <p>Loading...</p> :
        <>
          <div className="levelboard-header">
            <div className="levelboard-title">
              <button onClick={() => swapLevels(setLevelId(0))}>←Prev</button>
              <h1>{title}</h1>
              <button onClick={() => swapLevels(setLevelId(1))}>Next→</button>
              </div>
              <div className="levelboard-back">
              <Link to={`/games/${getGame()}`}>
                  <button>Back to Level Select</button>
              </Link>
              </div>
          </div>
          <div className="levelboard-container">
            <div className="levelboard-board">
              <Board mode={getMode()} records={records}/>
            </div>
            {session ? 
               <div className="levelboard-submit">
               <h2>Submit a { getMode(false) }:</h2>
               <form onSubmit={ handleSubmit }>
                 <label htmlFor="record">{ getMode(false) }: </label>
                 <input 
                   id="record"
                   type="number"
                   value={ formValues.record }
                   onChange={ handleChange }
                 />
                 <p>{ formErrors.record }</p>
                 <label htmlFor="monkeyId">Monkey: </label>
                 <MonkeySelect /><br />
                 <label htmlFor="proof">Proof: </label>
                 <input 
                   id="proof"
                   type="url"
                   value={ formValues.proof }
                   onChange={handleChange}
                 />
                 <p>{ formErrors.proof }</p>
                 <label htmlFor="comment">Comment (optional): </label>
                 <input 
                   id="comment"
                   type="text"
                   value={ formValues.comment }
                   onChange={handleChange}
                 />
                 <p>{ formErrors.comment }</p>
                 <button>Submit</button>
               </form>
             </div>
             :
             ""
            }
           
          </div>
        </>
        
      }
    </div>

  )
}

export default Levelboard;