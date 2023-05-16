const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

// const con = mysql.createConnection({
//     host: 'localhost',
//     port: '3306',
//     user: 'root',
//     password: 'password',
//     database: 'bareshao_f'
// });

const con = mysql.createConnection({
    host: '198.38.83.75',
    user: 'bareshao_f',
    password: '6D2?19slm',
    database: 'bareshao_f'
});

const server = app.listen(1348, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Server started at http://' + host + ':' + port);
});

con.connect(function (error) {
    if (error) {
        console.log(error);
    } else {
        console.log('Connected to the database');
    }
});

app.get('/user', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    const { username } = req.query;

    const sql = `SELECT * FROM fatura WHERE emri = '${username}'`;
    con.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});

app.post('/login', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    const { username, password } = req.body;
    const sql = `SELECT * FROM klientet WHERE perdoruesi = '${username}' AND fjalkalimi = '${password}'`;
    con.query(sql, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred' });
        } else if (rows.length === 0) {
            res.send({ success: false, message: 'Invalid username or password' });
        } else {
            res.send({ success: true, user: rows[0] });
        }
    });
});


app.get('/get-data', function (req, res) {
    const { username } = req.query;

    // Combined query to fetch data from 'fatura', 'shitje', and 'pagesat' tables
    const getDataQuery = `
      SELECT f.*, s.*, p.shuma
      FROM fatura AS f
      INNER JOIN (SELECT * FROM shitje ORDER BY id DESC) AS s
      ON f.fatura = s.fatura
      LEFT JOIN (SELECT shuma, fatura FROM pagesat ORDER BY id DESC) AS p
      ON f.fatura = p.fatura
      WHERE f.emri = (SELECT id FROM klientet WHERE perdoruesi = '${username}')
      ORDER BY f.id DESC
    `;

    con.query(getDataQuery, function (error, data, fields) {
        if (error) {
            console.log(error);
            res.status(500).json({ error: 'An error occurred' });
        } else {
            res.send({ success: true, data });
        }
    });
});
