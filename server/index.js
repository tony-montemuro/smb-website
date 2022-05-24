const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

app.use(cors());
app.use(express.json());

const smbDB = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '%ua!gJ_QzeK95Wu9D@nC',
    database: 'smb'
});

app.get('/games', (req, res) => {
    smbDB.query(
        `SELECT * from games`,
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )

    // db.query(
    //     `SELECT * from level_${req.params.id}`,
    //     (err, result) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             res.send(result);
    //         }
    //     }
    // );
});

app.listen(3001, () => {
    console.log('Server running on port 3001.');
});