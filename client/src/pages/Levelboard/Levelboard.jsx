// styling
import "./levelboard.css";

// js imports
import React from "react";
import LevelboardInit from "./LevelboardInit";
import Board from "./Board";
import Popup from "./Popup";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Levelboard() {
  const { loading,
          records,
          title, 
          levelList,
          levelLength,
          isMod,
          formValues, 
          formErrors,
          hasUserSubmitted,
          isSubmit,
          popup,
          submitting,
          setPopup,
          init,
          sortLevels,
          submit,
          remove,
          handleChange,
          swapLevels, 
          handleSubmit,
          getGame, 
          getMode, 
          updateStates,
          setLevelId, 
          MonkeySelect
  } = LevelboardInit();

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if the length of levelList has been filled, we can set the title, and set loading to false,
    // since this is the largest api call
    if (loading && levelLength && levelList.length === levelLength) {
      sortLevels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelList]);

  useEffect(() => {
    // if there are no errors, and isSubmit is set to true, then submit the form values
    // to database
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      submit();
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
              <button onClick={ () => swapLevels(setLevelId(0)) }>←Prev</button>
              <h1>{ title }</h1>
              <button onClick={ () => swapLevels(setLevelId(1)) }>Next→</button>
              </div>
              <div className="levelboard-buttons">
                <Link to={ `/games/${getGame(false)}` }>
                    <button>Back to Level Select</button>
                </Link>
                <Link to={ `/games/${getGame(true)}/totalizer`}>
                  <button>Totalizer Table</button>
                </Link>
                <Link to={ `/games/${getGame(true)}/medals`}>
                  <button>Medal Table</button>
                </Link>
              </div>
          </div>
          <div className="levelboard-container">
            <div className="levelboard-board">
              <Board mode={ getMode() } records={ records } isMod={ isMod } removeFunc={ remove } />
            </div>
            {supabase.auth.user() ? 
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
                   onChange={ handleChange }
                 />
                 <p>{ formErrors.proof }</p>
                 <label htmlFor="comment">Comment (optional): </label>
                 <input 
                   id="comment"
                   type="text"
                   value={ formValues.comment }
                   onChange={ handleChange }
                 />
                 <p>{ formErrors.comment }</p>
                 <button disabled={ submitting }>Submit</button>
               </form>
               {hasUserSubmitted ?
                <button disabled={ submitting } onClick={ () => updateStates(supabase.auth.user().id) }>Remove Run</button>
                :
                ""
                }
                <Popup trigger={ popup } setTrigger={ setPopup } mode={ getMode() } playerInfo={{ user_id: supabase.auth.user().id }} removeFunc={ remove } />
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