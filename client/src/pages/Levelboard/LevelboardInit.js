import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const LevelboardInit = () => {

    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // navigate used for redirecting
    const navigate = useNavigate();

    // states
    const [records, setRecords] = useState([]);
    const [title, setTitle] = useState("");
    const [levelList, setLevelList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // path variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const abb = pathArr[2];
    const mode = capitalize(pathArr[3]);
    let levelId = parseInt(pathArr[4]);

    // offset variables
    const smb1TotalLevels = 9;
    const smb2TotalLevels = 11;

    // function that converts a normal string to one in snake case
    const toSnake = (str) => {
        str = str.toLowerCase();
        str = str.replace(' ', '_');
        return str;
    };

    const checkPath = async () => {
        let approvedGame = false;
        let approvedMode = false;

        // now, query the list of games. if the current url matches any of these
        // it is an approved path
        try {
            let {data: games, error, status} = await supabase
                .from("games")
                .select("abb");

            if (error && status !== 406) {
                throw error;
            }

            games.forEach(game => {
                const gameAbb = game.abb;
                if (abb === gameAbb) {
                    approvedGame = true;
                }
            });

            // now, check to make sure the mode is either time or score
            if (mode === "Time" || mode === "Score") {
                approvedMode = true;
            }

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approvedGame || !approvedMode) {
                navigate("/");
            }

        } catch(error) {
            alert(error.message);
        }
    }

    const getRecords = async () => {
        if (mode === "Time") {
            if (abb === "smb1") {
                levelId += smb1TotalLevels;
            }
            if (abb === "smb2") {
                levelId += smb2TotalLevels
            }
        }

        try {
            let { data: records, error, status } = await supabase
                .from(`${abb}_${levelId}`)
                .select("*");

            if (error && status !== 406) {
                throw error;
            }

            // if querying a time chart, we need to fix it so that each time has two
            // decimal places.
            if (mode === "Time") {
                for (let record of records) {
                    record.Time = record.Time.toFixed(2);
                }
            }

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            for (let i = 0; i < records.length; i++) {
                records[i]["Position"] = posCount;
                trueCount++;
                if (i < records.length-1 && records[i+1][mode] !== records[i][mode]) {
                    posCount = trueCount;
                }
            }

            console.log(records);
            setRecords(records);
            setLoading(false);

        } catch (error) {
            alert(error.message);
        }
    }

    const addLevels = async (mode, levelList) => {
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

        try {
            let {data: levels, error, status} = await supabase
                .from(`${gameAbb}_${toSnake(mode)}`)
                .select("name");

            if (error && status !== 406) {
                throw error;
            }

            levels.forEach((level) => {
                levelList.push(level.name);
            });

        } catch(error) {
            throw (error.message);
        }
    }

    const generateLevelList = async (modes) => {
        let levelList = [];
        for (let mode of modes ) {
            await addLevels(mode, levelList);
        };
        setTitle(`${mode}: ${levelList[levelId-1]}`);
        setLevelList(levelList);
        getRecords();
        
    }

    const queryModes = async () => {
        let modeList = [];
        let gameAbb = abb;
        if (gameAbb === "smb2pal") {
            gameAbb = "smb2";
        }

        try {
            let {data: modes, error, status} = await supabase
                .from(`${gameAbb}_modes`)
                .select("name");

            if (error && status !== 406) {
                throw error;
            }

            for (let mode of modes) {
                modeList.push(mode.name);
            }
            return modeList;

        } catch(error) {
            alert(error.message);
        }
    }

    const getTitleAndRecords = async () => {
        const modes = await queryModes();
        generateLevelList(modes);
    }

    const swapLevels = (id) => {
        navigate(`/games/${abb}/${getMode(true)}/${id}`);
        window.location.reload();
    }
    
    const getGame = () => {
        return abb;
    }

    const getMode = (lower) => {
        // if lower is true, return the mode in lowercase. otherwise, simply return mode.
        return lower ? pathArr[3] : mode;
    }

    const getLevelId = (increment) => {
        // if increment is zero, decrement mode. otherwise, increment mode.

        // now, we need to ensure user cannot navigate to an unexisting level (id < 0
        // or id > levelList.length). this function will prevent user from doing this
        if (!increment && levelId > 1) {
            return levelId-1;
        }
        if (increment && levelId < levelList.length) {
            return levelId+1;
        }
        return levelId;
    }

    const Board = () => {
        return (
          <>
              <div className="levelboard-header">
                  <div className="levelboard-title">
                  <button onClick={() => swapLevels(getLevelId(0))}>←Prev</button>
                  <h1>{title}</h1>
                  <button onClick={() => swapLevels(getLevelId(1))}>Next→</button>
                  </div>
                  <div className="levelboard-back">
                  <Link to={`/games/${getGame()}`}>
                      <button>Back to Level Select</button>
                  </Link>
                  </div>
              </div>
              <div className="levelboard-container">
                  <table>
                  <tbody>
                      <tr>
                          <th>Position</th>
                          <th>Name</th>
                          <th>{getMode()}</th>
                          <th>Date</th>
                          <th>Monkey</th>
                          <th>Proof</th>
                      </tr>
                      {records.map((val) => {
                          return <tr>
                          <td>{val.Position}</td>
                          <td>{val.Name}</td>
                          <td>{getMode() === "Score" ? val.Score : val.Time}</td>
                          <td>{val.Month}/{val.Day}/{val.Year}</td>
                          <td>{val.Monkey}</td>
                          <td>{val.Proof !== "none" ? <a href={val.Proof} target="_blank" rel="noopener noreferrer">☑️</a> : ''}</td>
                          </tr>  
                      })}
                  </tbody>
                  </table>
              </div>
          </>
        )
      }

    return { loading, checkPath, getTitleAndRecords, Board };
}

export default LevelboardInit;