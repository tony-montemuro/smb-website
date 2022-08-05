import "/node_modules/flag-icons/css/flag-icons.min.css";
import React from 'react';
import { Link } from 'react-router-dom';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ data }) {
    return (
        <table>
            <tbody>
            <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Platinum</th>
                <th>Gold</th>
                <th>Silver</th>
                <th>Bronze</th>
            </tr>
                {data.map((val) => {
                    return <tr key={`${val.Name}-row`}>
                        <td>{val.Position}</td>
                        <td>
                            <div className="medals-user-info">
                                <div><SimpleAvatar url={val.Avatar_URL} size={50}/></div>
                                {val.Country ?
                                    <div><span className={`fi fi-${val.Country.toLowerCase()}`}></span></div>
                                    :
                                    ""
                                }
                                <div><Link to={`/user/${val.user_id}`}>{val.Name}</Link></div>
                            </div>
                        </td>
                        <td>{val.platinum}</td>
                        <td>{val.gold}</td>
                        <td>{val.silver}</td>
                        <td>{val.bronze}</td>
                    </tr>  
                })}
            </tbody>
        </table>
    );
}

export default React.memo(Board);