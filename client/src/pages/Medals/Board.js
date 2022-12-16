import "/node_modules/flag-icons/css/flag-icons.min.css";
import React from 'react';
import { Link } from 'react-router-dom';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ data, loading }) {
    return (
        <div className="medal-table-board">
            { loading ?
                <p>Loading...</p>
            :
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
                            return <tr key={ `${ val.name }-row` }>
                                <td>{ val.position }</td>
                                <td>
                                    <div className="medals-user-info">
                                        <div><SimpleAvatar url={ val.avatar_url } size={ 50 }/></div>
                                        {val.Country ?
                                            <div><span className={`fi fi-${ val.country.toLowerCase() }`}></span></div>
                                            :
                                            ""
                                        }
                                        <div><Link to={`/user/${ val.user_id }`}>{ val.name }</Link></div>
                                    </div>
                                </td>
                                <td>{ val.platinum }</td>
                                <td>{ val.gold }</td>
                                <td>{ val.silver }</td>
                                <td>{ val.bronze }</td>
                            </tr>  
                        })}
                    </tbody>
                </table>   
            }
        </div>
    );
}

export default React.memo(Board);