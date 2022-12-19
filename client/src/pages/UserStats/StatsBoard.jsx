import "/node_modules/flag-icons/css/flag-icons.min.css";
import React from "react";
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function StatsBoard({ total, medals, user, mode }) {
  return (
    <div className="stats-board-body">
        <h1>{ mode }</h1>
        <div className="stats-table-container">
            <h2>{ total.title } { mode } Total</h2>
            {total.hasData ?
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Player</th>
                            <th>{ mode } Total</th>
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
                            { mode === "Score" ? 
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
            <h2>{ medals.title } { mode } Medals</h2>
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
    </div>
  );
};

export default StatsBoard;