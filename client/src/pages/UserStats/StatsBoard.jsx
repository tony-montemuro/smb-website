import "./userstats.css"
import "/node_modules/flag-icons/css/flag-icons.min.css";
import React from "react";
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import FrontendHelper from "../../helper/FrontendHelper";

function StatsBoard({ info, user, type, game }) {
  // initialize variables
  const total = info.total;
  const medals = info.medals;
  const rankings = info.rankings;

  // helper functions
  const { cleanLevelName } = FrontendHelper();

  // statsborad component
  return (
    <div className="stats-board-body">
        <h1>{ type }</h1>
        <div className="stats-table-container">
            <h2>{ type } Total</h2>
            {total.hasData ?
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Player</th>
                            <th>{ type } Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{ total.position }</td>
                            <td>
                                <div className="user-stats-info">
                                    <div><SimpleAvatar url={ user.avatar_url } size={ 50 }/></div>
                                    {user.country ?
                                        <div><span className={ `fi fi-${ user.country.toLowerCase() } `}></span></div>
                                        :
                                        ""
                                    }
                                    <div><Link to={ `/user/${user.user_id}` }>{ user.username }</Link></div>
                                </div>
                            </td>
                            { type === "Score" ? 
                                <td>{ total.total }</td>
                            :
                                <td>{ total.hours }:{ total.minutes }:{ total.seconds }.{ total.centiseconds }</td>
                            }
                            
                        </tr>
                    </tbody>
                </table>
            :
                <p><i>This user has not submitted to this category.</i></p>
            }
        </div>
        <div className="stats-table-container">
            <h2>{ type } Medals</h2>
            {medals.hasData && total.hasData ?
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Player</th>
                            <th>Platinum</th>
                            <th>Gold</th>
                            <th>Silver</th>
                            <th>Bronze</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{ medals.position }</td>
                            <td>
                                <div className="user-stats-info">
                                    <div><SimpleAvatar url={ user.avatar_url } size={ 50 }/></div>
                                    {user.country ?
                                        <div><span className={ `fi fi-${ user.country.toLowerCase() }` }></span></div>
                                        :
                                        ""
                                    }
                                    <div><Link to={ `/user/${user.user_id}` }>{ user.username }</Link></div>
                                </div>
                            </td>
                            <td>{ medals.platinum }</td>
                            <td>{ medals.gold }</td>
                            <td>{ medals.silver }</td>
                            <td>{ medals.bronze }</td>
                        </tr>
                    </tbody>
                </table>
            :
                <p><i>This user has not submitted to this category.</i></p>
            }
        </div>
        <div className="stats-records">
            <h2>Best { type }s</h2>
            {rankings["modes"].map(mode => {
            return (
                <table key={mode}>
                <thead>
                    <tr>
                        <th colSpan={4}>{ cleanLevelName(mode) }</th>
                    </tr>
                    <tr>
                        <th>Level Name</th>
                        <th>{ type }</th>
                        <th>Position</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rankings[mode].map(level => {
                        return (
                            <tr key={ level.level }>
                                <td>
                                    <Link 
                                        to={ { pathname: `/games/${ game.abb }/${ game.category }/${ type.toLowerCase() }/${ level.level }` } }
                                        className="stats-records-links">
                                        {cleanLevelName(level.level)}
                                    </Link>
                                </td>
                                <td>{ level.record }</td>
                                <td>{ level.position }</td>
                                <td>{ level.date }</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            )})}
        </div>
    </div>
  );
};

export default StatsBoard;