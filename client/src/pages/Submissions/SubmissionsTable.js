import React, { memo } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function SubmissionsTable({ data, toggleBtn, games, buttonFunc }) {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, cleanLevelName, dateB2F, recordB2F } = FrontendHelper();

    // submissions table object
    return (
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    { data.isApproved ? <th>Game</th> : null }
                    <th>Level Name</th>
                    <th>Mode</th>
                    <th>Record</th>
                    <th>Date</th>
                    <th>Region</th>
                    <th>Live Status</th>
                    <th>Proof</th>
                    <th>Comment</th>
                    { data.isApproved ? <th>Unapprove</th> : <th>Approved</th> }
                </tr>
            </thead>
            <tbody>
            { data.list.map(row => {
                return <tr key={ row.details.submitted_at }>
                    <td>
                        <div className="submissions-user-info">
                        { row.user.country ?
                            <div><span className={ `fi fi-${ row.user.country.toLowerCase() }` }></span></div>
                        :
                            null
                        }
                        <div><Link to={ `/user/${ row.user.id }` }>{ row.user.username }</Link></div>
                        </div>
                    </td>
                    { data.isApproved ? <td>{ row.game.name }</td> : null }
                    <td>
                        <Link to={ `/games/${ games.current }/${ row.level.misc ? "misc" : "main" }/${ row.score ? "score" : "time" }/${ row.level.name }` }>
                        { cleanLevelName(row.level.name) }
                        </Link>
                    </td>
                    <td>{ capitalize(row.score ? "score" : "time") }</td>
                    <td>{ recordB2F(row.details.record, row.score ? "score" : "time") }</td>
                    <td>{ dateB2F(row.details.submitted_at) }</td>
                    <td>{ row.details.region.region_name }</td>
                    { row.details.live ? <td>Live</td> : <td>Non-live</td> }
                    <td>{ row.details.proof !== "none" ? <a href={ row.details.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>
                    <td>{ row.details.comment }</td>
                    <td>
                        { data.isApproved ?
                            <button onClick={ () => buttonFunc(row) } disabled={ toggleBtn }>Unapprove</button>
                        :
                            <button onClick={ () => buttonFunc(row, games.all) } disabled={ toggleBtn }>Approve</button>
                        }
                    </td>
                </tr>
            })}
            </tbody>
        </table>
    );
};

export default memo(SubmissionsTable);