import React from 'react';
import { Link } from 'react-router-dom';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ isScore, data }) {
    return (
        <table>
            <tbody>
            <tr>
                <th>Position</th>
                <th>Name</th>
                <th>{isScore ? "Total Score" : "Total Time"}</th>
            </tr>
                {data.map((val) => {
                    return <tr key={`${val.Name}-row`}>
                        <td>{val.Position}</td>
                        <td>
                            <div className="totals-user-info">
                            <div><SimpleAvatar url={val.Avatar_URL} size={50}/></div>
                                {val.Country ?
                                    <div><span className={`fi fi-${val.Country.toLowerCase()}`}></span></div>
                                    :
                                    ""
                                }
                                <div><Link to={`/user/${val.user_id}`}>{val.Name}</Link></div>
                            </div>
                        </td>
                        {isScore ?
                            <td>{val.total}</td>
                        : 
                            <td>{val.Hours}:{val.Minutes}:{val.Seconds}.{val.Centiseconds}</td>
                        }
                    </tr>  
                })}
            </tbody>
        </table>
    );
}

export default React.memo(Board);