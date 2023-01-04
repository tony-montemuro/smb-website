import "/node_modules/flag-icons/css/flag-icons.min.css";
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import FrontendHelper from "../../helper/FrontendHelper";
import SimpleAvatar from "../../components/SimpleAvatar/SimpleAvatar";

function Board({ data, loading, mode }) {
    // helper functions
    const { capitalize } = FrontendHelper();

    // board component
    return (
        <div className="medals-container">
            <h2>{ capitalize(mode) } Medal Table</h2>
            { loading ?
                <p>Loading...</p>
            :
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Name</th>
                            <th>Platinum</th>
                            <th>Gold</th>
                            <th>Silver</th>
                            <th>Bronze</th>
                        </tr>
                    </thead>
                    <tbody>
                        { data.length === 0 ?
                            <tr>
                                <td colSpan={ 6 } className="medals-empty">There have been no live submissions to this game's category!</td>
                            </tr>
                        :
                            data.map((val) => {
                                return (
                                    <tr key={ `${ val.name }-row` }>
                                    <td>{ val.position }</td>
                                    <td>
                                        <div className="medals-user-info">
                                            <div className="medals-user-image"><SimpleAvatar url={ val.avatar_url }/></div>
                                            {val.Country ?
                                                <div><span className={ `fi fi-${ val.country.toLowerCase() }` }></span></div>
                                                :
                                                ""
                                            }
                                            <div><Link to={ `/user/${ val.user_id }` }>{ val.name }</Link></div>
                                        </div>
                                    </td>
                                    <td>{ val.platinum }</td>
                                    <td>{ val.gold }</td>
                                    <td>{ val.silver }</td>
                                    <td>{ val.bronze }</td>
                                </tr>  
                            );})
                        }
                    </tbody>   
                </table>              
            }
        </div>
    );
};

export default memo(Board);