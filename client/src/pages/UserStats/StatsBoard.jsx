import "/node_modules/flag-icons/css/flag-icons.min.css";
import React from "react";
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function StatsBoard({ total, medals, user }) {
    // helper function used to capitalize an input string called str
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

  return (
    <div className="stats-board-body">
        <h1>{ capitalize(total.mode) }</h1>
        <div className="stats-table-container">
            <h2>{ total.title } { capitalize(total.mode) } Total</h2>
            {total.hasData ?
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Player</th>
                            <th>{ capitalize(total.mode) } Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{ total.Position }</td>
                            <td>
                                <div className="user-stats-info">
                                    <div><SimpleAvatar url={ user.avatar_url } size={ 50 }/></div>
                                    {user.country ?
                                        <div><span className={`fi fi-${user.country.toLowerCase()}`}></span></div>
                                        :
                                        ""
                                    }
                                    <div><Link to={ `/user/${user.user_id}` }>{ user.username }</Link></div>
                                </div>
                            </td>
                            { total.mode === "score" ? 
                                <td>{ total.total }</td>
                            :
                                <td>{total.Hours}:{total.Minutes}:{total.Seconds}.{total.Centiseconds}</td>
                            }
                            
                        </tr>
                    </tbody>
                </table>
            :
                <p><i>This user has not submitted to this category.</i></p>
            }
        </div>
        <div className="stats-table-container">
            <h2>{medals.title} { capitalize(medals.mode) } Medals</h2>
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
                            <td>{ medals.Position }</td>
                            <td>
                                <div className="user-stats-info">
                                    <div><SimpleAvatar url={ user.avatar_url } size={ 50 }/></div>
                                    {user.country ?
                                        <div><span className={`fi fi-${user.country.toLowerCase()}`}></span></div>
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
  )
}

export default StatsBoard