import React from 'react';
import { Link } from 'react-router-dom';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ isScore, data }) {
    return (
        <table>
            <tbody>
            <tr>
                <th>Name</th>
                <th>{isScore ? "Total Score" : "Total Time"}</th>
            </tr>
                {data.map((val) => {
                    return <tr key={`${val.Name}-row`}>
                    <td className="user-info">
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
                    <td>{val.total}</td>
                    </tr>  
                })}
            </tbody>
        </table>
    );
}

export default React.memo(Board);