const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());

const smb1_modes = ["Beginner", "Beginner Extra", "Advanced", "Advanced Extra", "Expert", "Expert Extra", "Master"];
const smb2_modes = ["Beginner", "Beginner Extra", "Advanced", "Advanced Extra", "Expert", "Expert Extra", "Master", "Master Extra", "Story Mode - World 10"];
const smb2_like = ['smb2', 'smb2pal', 'smbdx'];

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
        res.send(smb1_modes);
    } 
    else if (smb2_like.includes(game)) {
        res.send(smb2_modes);
    } 
    else {
        res.send([]);
    }
});

app.get("/games/:game/:mode", (req, res) => {
    // first, establish the games and mode to query levels from
    const game = req.params.game;
    const mode = req.params.mode;

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

app.listen(3001, () => {
    console.log("Server running on port 3001.");
});

const normalToSnake = (str) => {
    str = str.toLowerCase();
    str = str.replaceAll(' ', '_');
    return str;
}