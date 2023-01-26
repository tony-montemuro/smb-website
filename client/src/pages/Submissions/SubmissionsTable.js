import React, { memo } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardHelper from "../../helper/LevelboardHelper";

function SubmissionsTable({ data, toggleBtn, games, buttonFunc }) {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, cleanLevelName } = FrontendHelper();
    const { dateB2F } = LevelboardHelper();

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
                return <tr key={ row.submitted_at }>
                    <td>
                        <div className="submissions-user-info">
                        { row.profiles.country ?
                            <div><span className={ `fi fi-${ row.profiles.country.toLowerCase() }` }></span></div>
                        :
                            null
                        }
                        <div><Link to={ `/user/${ row.profiles.id }` }>{ row.profiles.username }</Link></div>
                        </div>
                    </td>
                    { data.isApproved ? <td>{ row.game.name }</td> : null }
                    <td>
                        <Link to={ `/games/${ games.current }/${ row.level.misc ? "misc" : "main" }/${ row.type }/${ row.level.name }` }>
                        { cleanLevelName(row.level.name) }
                        </Link>
                    </td>
                    <td>{ capitalize(row.type) }</td>
                    <td>{ row.record }</td>
                    <td>{ dateB2F(row.submitted_at) }</td>
                    <td>{ row.region.region_name }</td>
                    { row.live ? <td>Live</td> : <td>Non-live</td> }
                    <td>{ row.proof !== "none" ? <a href={ row.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>
                    <td>{ row.comment }</td>
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