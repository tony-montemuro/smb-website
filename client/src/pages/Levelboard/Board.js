import React, { useState } from "react";
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import FrontendHelper from "../../helper/FrontendHelper";
import Popup from "./Popup";

function Board({ game, records, state, isMod }) {
    // states
    const [popup, setPopup] = useState(false);
    const [currInfo, setCurrInfo] = useState({});

    // Helper functions
    const { capitalize } = FrontendHelper();

    // function that will update states when delete button is presesd
    const updateStates = (val) => {
        const obj = {
            user_id: val.user_id,
            game_id: game.abb,
            level_id: game.levelName,
            mode: game.mode,
            [game.mode]: val[game.mode],
            name: val.name
        };
        setCurrInfo(obj);
        setPopup(true);
    }

    // Board component
    return (
        <div className="levelboard-container">
            <table>
                <tbody>
                    <tr>
                        <th>Position</th>
                        <th>Name</th>
                        <th>{ capitalize(game.mode) }</th>
                        <th>Date</th>
                        <th>Monkey</th>
                        <th>Proof</th>
                        <th>Comment</th>
                        <td>Approved</td>
                        {isMod ? <td>Delete</td> : ""}
                    </tr>
                    {records[state].map((val) => {
                        return <tr key={ `${ val.name }-row` }>
                            <td>{ val.position }</td>
                            <td>
                                <div className="levelboard-user-info">
                                    <div className="levelboard-user-image"><SimpleAvatar url={ val.avatar_url }/></div>
                                    { val.country ?
                                        <div><span className={`fi fi-${val.country.toLowerCase()}`}></span></div>
                                        :
                                        ""
                                    }
                                    <div><Link to={`/user/${ val.user_id }`}>{ val.name }</Link></div>
                                </div>
                            </td>
                            <td>{ val[game.mode] }</td>
                            <td>{ val.month }/{ val.day }/{ val.year }</td>
                            <td>{ val.monkey }</td>
                            <td>{ val.proof !== "none" ? <a href={ val.proof } target="_blank" rel="noopener noreferrer">☑️</a> : '' }</td>
                            <td>{ val.comment }</td>
                            <td>{ val.approved ? "True" : "False" }</td>
                            {isMod ? <td><button onClick={ () => updateStates(val) }>❌</button></td> : ""}
                        </tr>
                    })}
                </tbody>
            </table>
            <Popup trigger={ popup } setTrigger={ setPopup } recordInfo={ currInfo } />
        </div>
    );
};

export default React.memo(Board);