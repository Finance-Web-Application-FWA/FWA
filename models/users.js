const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../db_files/user_data.db');

let database = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

database.serialize(() => {
    database.run(`CREATE TABLE IF NOT EXISTS users
                  (
                      id
                      INTEGER
                      PRIMARY
                      KEY
                      AUTOINCREMENT,
                      username
                      TEXT
                      NOT
                      NULL
                      UNIQUE,
                      password
                      TEXT
                      NOT
                      NULL,
                      data
                      TEXT
                  )`);
});

function insertUser(username, password) {
    return new Promise((resolve, reject) => {

        var return_message = {'response': {'result': '', 'data': ''}};
        let sql = `INSERT INTO users(username, password)
                   VALUES (?, ?)`;
        let params = [username, password];

        return database.run(sql, params, function (err, res) {
            if (err) {
                return_message['response'] = {'result': 'fail', 'data': 'Error inserting data' + err.message};
                return reject(return_message);
            }
            return_message['response'] = {'result': 'ok', 'data': {'id': this.lastID, 'username': username}};
            return resolve(return_message);
        });
    });
}

function IsUsernamePasswordValid(username, password) {
    return new Promise((resolve, reject) => {

        var return_message = {'response': {'result': '', 'data': ''}};
        let sql = `SELECT *
                   FROM users
                   WHERE username = ?
                     AND password = ?`;
        let params = [username, password];

        return database.get(sql, params, function (err, res) {
            if (err) {
                return_message['response'] = {'result': 'fail', 'data': 'Error fetching data'};

                return reject(return_message);
            }
            if (res) {
                return_message['response'] = {'result': 'ok', 'data': true,'id':res['id'],'user_name':res['username']};
            } else {
                return_message['response'] = {'result': 'ok', 'data': false};
            }
            return resolve(return_message);
        });
    });
}

function is_username_exist(username) {
    return new Promise((resolve, reject) => {

        var return_message = {'response': {'result': '', 'data': ''}};
        let sql = `SELECT *
                   FROM users
                   WHERE username = ?`;
        let params = [username];

        return database.get(sql, params, function (err, res) {
            if (err) {
                return_message['response'] = {'result': 'fail', 'data': 'Error fetching data'};
                return reject(return_message);
            }

            if (res) {

                return_message['response'] = {'result': 'ok', 'data': true};
            } else {
                return_message['response'] = {'result': 'ok', 'data': false};
            }
            return resolve(return_message);
        });
    });
}


module.exports = database;
module.exports.insertUser = insertUser;
module.exports.IsUsernamePasswordValid = IsUsernamePasswordValid;
module.exports.is_username_exist = is_username_exist;