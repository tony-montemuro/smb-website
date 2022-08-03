import React, { useState } from 'react';
import { Link } from "react-router-dom";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";
import Popup from './Popup';

function Board({ mode, allRecords, records, showAll, isMod, removeFunc }) {
  // states
  const [popup, setPopup] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState({});

  // function that will update states when delete button is presesd
  const updateStates = (info) => {
    setCurrentPlayer(info);
    setPopup(true);
  }

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
                    {isMod ? <th>Delete</th> : ""}
                </tr>
                {showAll ? 
                    allRecords.map((val) => {
                        return <tr key={`${val.Name}-row`}>
                        <td>{val.Position}</td>
                        <td className="levelboard-user-info">
                            <div><SimpleAvatar url={val.Avatar_URL} size={50}/></div>
                            {val.Country ?
                                <div className="country-icon">
                                    <img
                                        alt={val.Country}
                                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${val.Country}.svg`}
                                        style={{width: 30}}>
                                    </img>
                                </div>
                                :
                                ""
                            }
                            <div><Link to={`/user/${val.user_id}`}>{val.Name}</Link></div>
                        </td>
                        <td>{mode === "Score" ? val.Score : val.Time}</td>
                        <td>{val.Month}/{val.Day}/{val.Year}</td>
                        <td>{val.Monkey}</td>
                        <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                        <td>{val.Comment}</td>
                        {isMod ? <td><button onClick={ () => updateStates(val) }>❌</button></td> : ""}
                        </tr>  
                    })
                : 
                    records.map((val) => {
                        return <tr key={`${val.Name}-row`}>
                        <td>{val.Position}</td>
                        <td className="levelboard-user-info">
                            <div><SimpleAvatar url={val.Avatar_URL} size={50}/></div>
                            {val.Country ?
                                <div className="country-icon">
                                    <img
                                        alt={val.Country}
                                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${val.Country}.svg`}
                                        style={{width: 30}}>
                                    </img>
                                </div>
                                :
                                ""
                            }
                            <div><Link to={`/user/${val.user_id}`}>{val.Name}</Link></div>
                        </td>
                        <td>{mode === "Score" ? val.Score : val.Time}</td>
                        <td>{val.Month}/{val.Day}/{val.Year}</td>
                        <td>{val.Monkey}</td>
                        <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                        <td>{val.Comment}</td>
                        {isMod ? <td><button onClick={ () => updateStates(val) }>❌</button></td> : ""}
                        </tr>  
                    })
                }
            </tbody>
        </table>
        <Popup trigger={ popup } setTrigger={ setPopup } mode={ mode } playerInfo={ currentPlayer } removeFunc={ removeFunc } />
    </div>
  )
}

export default React.memo(Board);