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


function insertDashboardRawData(username_id,age, employmentStatus, income_monthly, rent, utilities, groceries, entertainment,
                                total_dept, total_assets, total_liabilities, principal, monthly_interest_rate, number_of_payments, months_of_coverage_desired, desired_retirement_income, withdrawal_rate, total_credit_card_balances, total_credit_card_limits, property_value, debt) {
    return new Promise((resolve, reject) => {
        var return_message = {'response': {'result': '', 'data': ''}};
        let sql = `INSERT INTO dashboard_data(username_id, age, employmentStatus, income_monthly, rent, utilities, groceries,
                                              entertainment, total_dept, total_assets, total_liabilities, principal,
                                              monthly_interest_rate, number_of_payments, months_of_coverage_desired,
                                              desired_retirement_income, withdrawal_rate, total_credit_card_balances,
                                              total_credit_card_limits, property_value, debt)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let params = [username_id,age, employmentStatus, income_monthly, rent, utilities, groceries, entertainment, total_dept, total_assets, total_liabilities, principal, monthly_interest_rate, number_of_payments, months_of_coverage_desired, desired_retirement_income, withdrawal_rate, total_credit_card_balances, total_credit_card_limits, property_value, debt];

        return database.run(sql, params, function (err, res) {
            if (err) {
                return_message['response'] = {'result': 'fail', 'data': 'Error inserting Raw data' + err.message};
                return reject(return_message);
            }
            return_message['response'] = {'result': 'ok', 'data': {'id': this.lastID}};
            return resolve(return_message);
        });
    });
}

function insertDashboardResultData(username_id,net_worth) {
    return new Promise((resolve, reject) => {
        var return_message = {'response': {'result': '', 'data': ''}};
        let sql = `INSERT INTO dashboard_results(username_id,net_worth)
                   VALUES (?, ?)`;
        let params = [username_id, net_worth];

        return database.run(sql, params, function (err, res) {
            if (err) {
                return_message['response'] = {'result': 'fail', 'data': 'Error inserting Result data' + err.message};
                return reject(return_message);
            }
            return_message['response'] = {'result': 'ok', 'data': {'id': this.lastID}};
            return resolve(return_message);
        });
    });
}


module.exports = database;
module.exports.insertDashboardRawData = insertDashboardRawData
module.exports.insertDashboardResultData = insertDashboardResultData