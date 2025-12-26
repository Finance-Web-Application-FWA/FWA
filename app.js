const geminiService = require('./services/gemini-service.js');
const express = require('express');
const session = require('express-session');
const uuid = require('uuid');
var users_model = require('./models/users.js')
var dashboard_model = require('./models/dashboard.js')
var hash_utility = require('./utilities/hashing')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended: false})
const app = express();
var allowCrossDomain = function (request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(session(
    {
        name: 'SessionCookie',
        genid: function (req) {
            return uuid.v4();
        }, // use UUIDs for session IDs
        secret: '1234567890',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false, expires: 60000}
    }));
app.use(allowCrossDomain);
app.use(express.json());
app.use(urlencodedParser);
app.use(express.static('public'));


app.post("/register", async function (request, response) {
    const {username, password} = request.body;
    var return_message = {'response': {'result': '', 'data': ''}};
    var exist_response = await users_model.is_username_exist(username);
    var hashed_password = hash_utility.HashPassword(password)
    if (exist_response['response']['result'] == 'ok') {
        if (exist_response['response']['data']) {
            return_message['response'] = {'result': 'fail', 'data': 'Username is Already Exist'};
        } else if (exist_response['response']['data'] == false) {
            var insert_response = await users_model.insertUser(username, hashed_password)
            if (insert_response['response']['result'] == 'ok') {
                return_message['response'] = {
                    'result': 'ok',
                    'data': 'Username successfully Registered'
                };
            } else if (insert_response['response']['result'] == 'fail') {
                return_message['response'] = {
                    'result': 'fail',
                    'data': 'Username Registration Failed'
                };
            }
        }
    } else {
        return_message['response'] = {'result': 'fail', 'data': 'Failed to check username Existence.'};
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(return_message));
    response.end();
});

app.post("/login", async function (request, response) {
    const {username, password} = request.body;
    var return_message = {'response': {'result': '', 'data': ''}};
    var hashed_password = hash_utility.HashPassword(password)
    var validate_response = await users_model.IsUsernamePasswordValid(username, hashed_password);
    if (validate_response['response']['result'] == 'ok') {
        if (validate_response['response']['data']) {
            request.session.username = username;
            request.session.save()
            return_message['response'] = {'result': 'ok', 'data': 'Username and Password is Valid','id':validate_response['response']['id'],'user_name':validate_response['response']['user_name']};
        } else if (validate_response['response']['data'] == false)
            return_message['response'] = {'result': 'fail', 'data': 'Username or Password is not Correct'};
    } else if (validate_response['response']['result'] == 'fail') {
        return_message['response'] = {'result': 'fail', 'data': validate_response['response']['data']};
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(return_message));
    response.end()
});

app.post("/saverawdata", async function (request, response) {
    const {
        username_id,
        age,
        employmentStatus,
        income_monthly,
        rent,
        utilities,
        groceries,
        entertainment,
        total_dept,
        total_assets,
        total_liabilities,
        principal,
        monthly_interest_rate,
        number_of_payments,
        months_of_coverage_desired,
        desired_retirement_income,
        withdrawal_rate,
        total_credit_card_balances,
        total_credit_card_limits,
        property_value,
        debt
    } = request.body;
    var return_message = {'response': {'result': '', 'data': ''}};
    var insert_response = await dashboard_model.insertDashboardRawData(username_id,age, employmentStatus, income_monthly, rent, utilities, groceries, entertainment, total_dept, total_assets, total_liabilities, principal, monthly_interest_rate, number_of_payments, months_of_coverage_desired, desired_retirement_income, withdrawal_rate, total_credit_card_balances, total_credit_card_limits, property_value, debt)
    if (insert_response['response']['result'] == 'ok') {
        return_message['response'] = {
            'result': 'ok',
            'data': 'Dashboard Raw Data successfully Inserted'
        };
    } else if (insert_response['response']['result'] == 'fail') {
        return_message['response'] = {
            'result': 'fail',
            'data': 'Dashboard Raw Data Insertion Failed'
        };
    }


    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(return_message));
    response.end()
});

app.post("/saveresultdata", async function (request, response) {
    const {username_id,net_worth} = request.body;
    var return_message = {'response': {'result': '', 'data': ''}};
    var insert_response = await dashboard_model.insertDashboardResultData(username_id,net_worth)
    if (insert_response['response']['result'] == 'ok') {
        return_message['response'] = {
            'result': 'ok',
            'data': 'Dashboard Result Data successfully Inserted'
        };
    } else if (insert_response['response']['result'] == 'fail') {
        return_message['response'] = {
            'result': 'fail',
            'data': 'Dashboard Result Data Insertion Failed'
        };
    }


    response.writeHead(200, {"Content-Type": "application/json"});
    response.write(JSON.stringify(return_message));
    response.end()
});

app.post("/generatereport", async function (request, response) {
    const financialData = request.body;
    
    // Validate that required data exists
    if (!financialData.username_id) {
        response.writeHead(400, {"Content-Type": "application/json"});
        response.write(JSON.stringify({
            response: {'result': 'fail', 'data': 'User not authenticated'}
        }));
        response.end();
        return;
    }

    try {
        const reportResult = await geminiService.generateFinancialReport(financialData);
        
        if (reportResult.success) {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify({
                response: {
                    'result': 'ok',
                    'data': reportResult.report,
                    'timestamp': reportResult.timestamp
                }
            }));
        } else {
            const errorData = reportResult.isQuotaExceeded ? reportResult.error : 'Error generating report: ' + reportResult.error;
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify({
                response: {
                    'result': 'fail',
                    'data': errorData,
                    'isQuotaExceeded': reportResult.isQuotaExceeded || false
                }
            }));
        }
    } catch (error) {
        console.error("Report generation error:", error);
        response.writeHead(500, {"Content-Type": "application/json"});
        response.write(JSON.stringify({
            response: {
                'result': 'fail',
                'data': 'Server error while generating report'
            }
        }));
    }
    response.end();
});

// 404 handlers MUST be last
app.get('*', function (request, response) {
    response.status(404).send('Error 404 - Page or URL is not Valid (GET)' + request.url);
    response.end()
});

app.post('*', function (request, response) {
    response.status(404).send('Error 404 - Page or URL is not Valid (Post)' + JSON.stringify(request.body));
    response.end()
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
