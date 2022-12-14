import React from 'react';
import { Link } from 'react-router-dom';
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ isScore, data, loading }) {
    return (
        <div className="totalizer-board">
            {loading ? 
                <p>Loading...</p> 
            :
                <table>
                    <tbody>
                    <tr>
                        <th>Position</th>
                        <th>Name</th>
                        <th>{ isScore ? "Total Score" : "Total Time" }</th>
                    </tr>
                        {data.map((val) => {
                            return <tr key={ `${val.name}-row` }>
                                <td>{ val.position }</td>
                                <td>
                                    <div className="totals-user-info">
                                    <div><SimpleAvatar url={ val.avatar_url } size={ 50 }/></div>
                                        { val.country ?
                                            <div><span className={`fi fi-${ val.country.toLowerCase() }`}></span></div>
                                            :
                                            ""
                                        }
                                        <div><Link to={ `/user/${val.user_id}` }>{ val.name }</Link></div>
                                    </div>
                                </td>
                                {isScore ?
                                    <td>{ val.total }</td>
                                : 
                                    <td>{ val.hours }:{ val.minutes }:{ val.seconds }.{ val.centiseconds }</td>
                                }
                            </tr>  
                        })}
                    </tbody>
                </table>
            }
        </div>
    );
}

export default React.memo(Board);