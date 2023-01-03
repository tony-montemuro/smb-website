import "./game.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function ModeTab({ game, mode, levels, category }) {
    // states
    const [show, setShow] = useState(false);

    // helper functions
    const { cleanLevelName } = FrontendHelper();

    // ModeTab component
    return (
        <tbody className="game-mode">
            <tr onClick={ () => setShow(!show) } className="game-mode-name">
                <td colSpan={ 3 }><h3>{ cleanLevelName(mode) }</h3></td>
            </tr>
            { levels.map(level => {
                return show ?
                    <tr className="game-level">
                        <td className="game-level-name">
                            <p>{ cleanLevelName(level.id) }</p>
                        </td>
                        { level.chart_type === "both" || level.chart_type === "score" ?
                            <td><Link to={ { pathname: `/games/${ game.abb }/${ category }/score/${ level.id }` } }><button>
                                Score
                            </button></Link></td>
                        :
                            <td></td>
                        }
                        { level.chart_type === "both" || level.chart_type === "time" ?
                            <td><Link to={ { pathname: `/games/${ game.abb }/${ category }/time/${ level.id }` } }><button>
                                Time
                            </button></Link></td>
                        :
                            <td></td>
                        }
                    </tr>
                :
                    null;
            })}
        </tbody>
    );
};

export default ModeTab;