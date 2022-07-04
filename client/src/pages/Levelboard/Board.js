import React from 'react';
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ mode, records }) {
  return (
    <div className="levelboard-container">
        <table>
            <tbody>
                <tr>
                    <th>Position</th>
                    <th>Name</th>
                    <th>{mode}</th>
                    <th>Date</th>
                    <th>Monkey</th>
                    <th>Proof</th>
                    <th>Comment</th>
                </tr>
                {records.map((val) => {
                    return <tr>
                    <td>{val.Position}</td>
                    <td className="user-info">
                        <div><SimpleAvatar url={val.Avatar_URL} size={50}/></div>
                        <div>
                            <img
                                alt={val.Country}
                                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${val.Country}.svg`}
                                style={{width: 30}}>
                            </img>
                        </div>
                        <div><Link to={`/user/${val.user_id}`}>{val.Name}</Link></div>
                    </td>
                    <td>{mode === "Score" ? val.Score : val.Time}</td>
                    <td>{val.Month}/{val.Day}/{val.Year}</td>
                    <td>{val.Monkey}</td>
                    <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                    <td>{val.Comment}</td>
                    </tr>  
                })}
            </tbody>
        </table>
    </div>
  )
}

export default React.memo(Board);