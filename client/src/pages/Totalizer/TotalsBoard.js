import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function TotalsBoard({ type, data, loading, imageReducer }) {
    /* ===== VARIABLES ===== */
	const imgLength = 50;

    /* ===== STATES ===== */
    const [boardState, setBoardState] = useState("live");

    /* ===== FUNCTIONS ===== */
    const { capitalize, secondsToHours } = FrontendHelper();

    /* ===== BOARD COMPONENT ===== */
    return (
        <div className="totalizer-container">
            <h2>{ capitalize(type) } Totals</h2>
            <div className="totalizer-input">
                <label htmlFor="all">Live-{ type }s only: </label>
                <input 
                    id="all"
                    type="checkbox"
                    checked={ boardState === "live" }
                    onChange={ () => setBoardState(boardState === "live" ? "all" : "live") }
                />
            </div>
            { loading ? 
                <p>Loading...</p> 
            :
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Name</th>
                            <th>Total { capitalize(type) }</th>
                        </tr>
                    </thead>
                    <tbody>
                        { data[boardState].length === 0 ? 
                            <tr>
                                <td colSpan={ 3 } className="totalizer-empty">
                                    There have been no { boardState === "live" ? boardState : "" } submissions to this game's category!
                                </td>
                            </tr>
                        :
                            data[boardState].map((row) => {
                                return <tr key={ `${ row.user.username }-row` }>
                                    <td>{ row.position }</td>
                                    <td>
                                        <div className="totals-user-info">
                                        <div className="totals-user-image"><SimpleAvatar url={ row.user.avatar_url } size={ imgLength } imageReducer={ imageReducer } /></div>
                                            { row.user.country ?
                                                <div><span className={ `fi fi-${ row.user.country.toLowerCase() }` }></span></div>
                                            :
                                                null
                                            }
                                            <div><Link to={ `/user/${ row.user.id }` }>{ row.user.username }</Link></div>
                                        </div>
                                    </td>
                                    { type === "score" ?
                                        <td>{ row.total }</td>
                                    : 
                                        <td>{ secondsToHours(row.total, type) }</td>
                                    }
                                </tr>  
                            })}
                    </tbody>
                </table>
            }
        </div>
    );
};

export default memo(TotalsBoard);