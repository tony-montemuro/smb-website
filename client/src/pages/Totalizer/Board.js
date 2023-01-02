import React, { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ type, data, loading }) {
    /* ===== STATES ===== */
    const [boardState, setBoardState] = useState("live");

    /* ===== FUNCTIONS ===== */
    const { capitalize } = FrontendHelper();

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
            {loading ? 
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
                            data[boardState].map((val) => {
                                return <tr key={ `${val.name}-row` }>
                                    <td>{ val.position }</td>
                                    <td>
                                        <div className="totals-user-info">
                                        <div><SimpleAvatar url={ val.avatar_url } size={ 50 }/></div>
                                            { val.country ?
                                                <div><span className={`fi fi-${ val.country.toLowerCase() }`}></span></div>
                                                :
                                                ""
                                            }
                                            <div><Link to={ `/user/${val.user_id}` }>{ val.name }</Link></div>
                                        </div>
                                    </td>
                                    {type === "score" ?
                                        <td>{ val.total }</td>
                                    : 
                                        <td>{ val.hours }:{ val.minutes }:{ val.seconds }.{ val.centiseconds }</td>
                                    }
                                </tr>  
                            })}
                    </tbody>
                </table>
            }
        </div>
    );
};

export default memo(Board);