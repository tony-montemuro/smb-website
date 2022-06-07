const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());

const smb1Modes = ["Beginner", "Beginner Extra", "Advanced", "Advanced Extra", "Expert", "Expert Extra", "Master"];
const smb2Modes = ["Beginner", "Beginner Extra", "Advanced", "Advanced Extra", "Expert", "Expert Extra", "Master", "Master Extra", "World 10"];
const smb2Like = ['smb2', 'smb2pal', 'smbdx'];

const smbDB = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "%ua!gJ_QzeK95Wu9D@nC",
    database: "smb"
});

app.get("/games", (req, res) => {
    smbDB.query(
        `SELECT * from games`,
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

app.get("/games/:game/modes", (req, res) => {
    const game = req.params.game;

    if (game === "smb1") {
        res.send(smb1Modes);
    } 
    else if (smb2Like.includes(game)) {
        res.send(smb2Modes);
    } 
    else {
        res.send([]);
    }
});

app.get("/games/:game/:mode", (req, res) => {
    // first, establish the games and mode to query levels from
    let game = req.params.game;
    const mode = req.params.mode;
    if (game === "smb2pal") {
        game = "smb2";
    }

    // then, perform the query
    smbDB.query(
        `SELECT * from ${game}_${normalToSnake(mode)}_levels`,
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

app.get("/games/:game/:mode/:levelId", (req, res) => {
    // variables used to query
    const game = req.params.game;
    const mode = req.params.mode;
    const levelId = req.params.levelId;

    // query for level records
    smbDB.query(
        `SELECT Name, ${mode}, Day, Month, Year, Monkey, Proof from ${game}_${levelId}`,
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                // variables used to determine position of each submission
                let trueCount = 1;
                let posCount = trueCount;

                // now, iterate through each record, and calculate the position.
                for (let i = 0; i < result.length; i++) {
                    result[i]["Position"] = posCount;
                    trueCount++;
                    if (i < result.length-1 && result[i+1][mode] != result[i][mode]) {
                        posCount = trueCount;
                    }
                }

                // finally, send the result
                res.send(result);
            }
        }
    )
});

app.listen(3001, () => {
    console.log("Server running on port 3001.");
});

const normalToSnake = (str) => {
    str = str.toLowerCase();
    str = str.replaceAll(' ', '_');
    return str;
}